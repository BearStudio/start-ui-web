import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const sourceFileExtensions = new Set(['.ts', '.tsx']);
const transactionApplicationErrorBoundaryFiles = new Set([
  path.join(
    'src',
    'modules',
    'book',
    'application',
    'use-cases',
    'update-book.ts'
  ),
  path.join(
    'src',
    'modules',
    'email',
    'application',
    'use-cases',
    'process-email-status-event.ts'
  ),
]);

function listSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    return sourceFileExtensions.has(path.extname(dir)) ? [dir] : [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return sourceFileExtensions.has(path.extname(entry.name))
      ? [entryPath]
      : [];
  });
}

function findImportViolations(files: string[], pattern: RegExp) {
  return files.flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    pattern.lastIndex = 0;
    return pattern.test(source) ? [path.relative(root, file)] : [];
  });
}

function findServerFunctionExports(files: string[]) {
  const pattern = /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*createServerFn\s*\(/g;

  return files.flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    return Array.from(source.matchAll(pattern), ([, name]) => ({
      file,
      name: name ?? '',
      source,
    }));
  });
}

function isServerFunctionEntrypoint(file: string) {
  return fs.readFileSync(file, 'utf8').includes('createServerFn');
}

function isPathInside(relativeFile: string, relativeDir: string) {
  return (
    relativeFile === relativeDir ||
    relativeFile.startsWith(`${relativeDir}${path.sep}`)
  );
}

function isDrizzleImportAllowedSource(relativeFile: string) {
  const segments = relativeFile.split(path.sep);

  return (
    isPathInside(
      relativeFile,
      path.join('src', 'modules', 'kernel', 'infrastructure', 'db')
    ) ||
    isPathInside(
      relativeFile,
      path.join('src', 'modules', 'auth', 'infrastructure', 'better-auth')
    ) ||
    (segments[0] === 'src' &&
      segments[1] === 'modules' &&
      segments[3] === 'infrastructure' &&
      segments[4] === 'drizzle')
  );
}

describe('strict modular monolith layout', () => {
  it('keeps legacy feature and shared roots removed', () => {
    expect(fs.existsSync(path.join(root, 'src/features'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/components'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/hooks'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/lib'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/layout'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/emails'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/platform'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'src/app'))).toBe(true);
    for (const appSupportRoot of [
      'build-info',
      'demo',
      'devtools',
      'i18n',
      'shell',
    ]) {
      expect(fs.existsSync(path.join(root, 'src/app', appSupportRoot))).toBe(
        true
      );
    }
  });

  it('requires module public split barrels where modules expose adapters', () => {
    for (const moduleName of ['account', 'auth', 'book', 'genre', 'user']) {
      const moduleRoot = path.join(root, 'src/modules', moduleName);
      expect(fs.existsSync(path.join(moduleRoot, 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(moduleRoot, 'presentation.ts'))).toBe(
        true
      );
      expect(fs.existsSync(path.join(moduleRoot, 'server.ts'))).toBe(true);
      expect(fs.existsSync(path.join(moduleRoot, 'client.ts'))).toBe(true);
      expect(fs.existsSync(path.join(moduleRoot, 'testing.ts'))).toBe(true);
    }
  });

  it('keeps core business modules in vertical hexagonal slices', () => {
    for (const moduleName of ['account', 'book', 'genre', 'user']) {
      const moduleRoot = path.join(root, 'src/modules', moduleName);

      for (const expectedPath of [
        'domain',
        path.join('application', 'use-cases'),
        path.join('application', 'ports'),
        path.join('transport', 'http'),
        'factory.ts',
        'index.ts',
      ]) {
        expect(fs.existsSync(path.join(moduleRoot, expectedPath))).toBe(true);
      }
    }

    for (const moduleName of ['auth', 'book', 'email', 'genre']) {
      expect(
        fs.existsSync(
          path.join(
            root,
            'src/modules',
            moduleName,
            'infrastructure',
            'drizzle',
            'schema.ts'
          )
        )
      ).toBe(true);
    }
  });

  it('keeps platform isolated from app code', () => {
    expect(
      findImportViolations(
        listSourceFiles(path.join(root, 'src/platform')),
        /from\s+['"]@\/(?:modules|routes|composition)(?:\/[^'"]*)?['"]/g
      )
    ).toEqual([]);
  });

  it('keeps module internals independent from composition', () => {
    const moduleRoots = fs
      .readdirSync(path.join(root, 'src/modules'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, 'src/modules', entry.name));

    const internalFiles = moduleRoots.flatMap((moduleRoot) => [
      ...[
        'domain',
        'application',
        'infrastructure',
        'transport',
        'presentation',
      ].flatMap((dirName) => listSourceFiles(path.join(moduleRoot, dirName))),
      ...listSourceFiles(path.join(moduleRoot, 'factory.ts')),
    ]);

    expect(
      findImportViolations(
        internalFiles,
        /from\s+['"]@\/composition(?:\/[^'"]*)?['"]/g
      )
    ).toEqual([]);
  });

  it('keeps feature modules independent from app support code', () => {
    expect(
      findImportViolations(
        listSourceFiles(path.join(root, 'src/modules')),
        /from\s+['"]@\/app(?:\/[^'"]*)?['"]/g
      )
    ).toEqual([]);
  });

  it('keeps testing gates out of production source imports', () => {
    const productionFiles = listSourceFiles(path.join(root, 'src')).filter(
      (file) =>
        !/[/\\](?:modules[/\\][^/\\]+|platform[/\\]runtime-config)[/\\]testing\.ts$/.test(
          file
        )
    );

    expect(
      findImportViolations(
        productionFiles,
        /from\s+['"]@\/(?:modules\/[^/'"]+|platform\/runtime-config)\/testing(?:\.[^/'"]*)?['"]/g
      )
    ).toEqual([]);
  });

  it('keeps feature repositories from starting database transactions directly', () => {
    const featureInfrastructureFiles = fs
      .readdirSync(path.join(root, 'src/modules'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'kernel')
      .flatMap((entry) =>
        listSourceFiles(
          path.join(root, 'src/modules', entry.name, 'infrastructure')
        )
      );

    expect(
      findImportViolations(
        featureInfrastructureFiles,
        /\brunWithDbTransaction\b/g
      )
    ).toEqual([]);
  });

  it('keeps routes on module public APIs', () => {
    expect(
      findImportViolations(
        listSourceFiles(path.join(root, 'src/routes')),
        /from\s+['"]@\/modules\/[^/'"]+\/(?!(?:index|presentation|server|backend|client|testing)(?:\.[^/'"]+)?(?:['"]|$))[^'"]+['"]/g
      )
    ).toEqual([]);
  });

  it('keeps presentation schemas free of i18n imports', () => {
    const schemaFiles = listSourceFiles(path.join(root, 'src/modules')).filter(
      (file) => file.endsWith(path.join('presentation', 'schema.ts'))
    );

    expect(
      findImportViolations(
        schemaFiles,
        /from\s+['"](?:i18next|react-i18next)['"]/g
      )
    ).toEqual([]);
  });

  it('keeps transport entry points thin', () => {
    const moduleTransportFiles = listSourceFiles(
      path.join(root, 'src/modules')
    ).filter((file) => file.includes(`${path.sep}transport${path.sep}`));
    const serverEntrypointFiles = listSourceFiles(
      path.join(root, 'src/modules')
    )
      .filter((file) => /[/\\](server|server-functions)\.ts$/.test(file))
      .filter(isServerFunctionEntrypoint);
    const apiRouteFiles = listSourceFiles(path.join(root, 'src/routes/api'));

    expect(
      findImportViolations(
        moduleTransportFiles,
        /from\s+['"]@\/composition(?:\/[^'"]*)?['"]/g
      )
    ).toEqual([]);
    expect(
      findImportViolations(
        [...moduleTransportFiles, ...serverEntrypointFiles, ...apiRouteFiles],
        /from\s+['"]@\/modules\/(?!kernel)[^/'"]+\/(?:infrastructure|presentation)(?:\/[^'"]*)?['"]/g
      )
    ).toEqual([]);
    expect(
      findImportViolations(
        [...moduleTransportFiles, ...serverEntrypointFiles, ...apiRouteFiles],
        /from\s+['"](?:drizzle-orm(?:\/[^'"]*)?|pg|postgres)['"]/g
      )
    ).toEqual([]);
  });

  it('confines Drizzle imports to persistence infrastructure', () => {
    const files = listSourceFiles(path.join(root, 'src')).filter((file) => {
      const relative = path.relative(root, file);
      return !isDrizzleImportAllowedSource(relative);
    });

    expect(
      findImportViolations(
        files,
        /(?:from\s+['"]|import\s*\(\s*['"])(?:drizzle-orm(?:\/[^'"]*)?|better-auth\/adapters\/drizzle)['"]/g
      )
    ).toEqual([]);
  });

  it('keeps TanStack server functions assigned to named variables', () => {
    const files = listSourceFiles(path.join(root, 'src'));

    expect(findImportViolations(files, /:\s*createServerFn\s*\(/g)).toEqual([]);
    expect(
      findImportViolations(
        files,
        /^[\t ]*const\s+\w+\s*=\s*createServerFn\s*\(/gm
      )
    ).toEqual([]);
  });

  it('keeps module server barrels dedicated to server functions', () => {
    const violations = listSourceFiles(path.join(root, 'src/modules'))
      .filter((file) => /[/\\]modules[/\\][^/\\]+[/\\]server\.ts$/.test(file))
      .flatMap((file) => {
        const source = fs.readFileSync(file, 'utf8');
        const relative = path.relative(root, file);
        const reexportsServerFunctions =
          /^export\s+\*\s+from\s+['"]\.\/transport\/server-functions\/server-functions['"];?$/.test(
            source.trim()
          );
        const definesServerFunction =
          source.includes('createServerFn') &&
          !/export\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];/.test(source);

        return reexportsServerFunctions || definesServerFunction
          ? []
          : [relative];
      });

    expect(violations).toEqual([]);
  });

  it('requires privileged server functions to use protected runners', () => {
    const publicServerFunctions = new Set([
      'configEnv',
      'currentSession',
      'initSsrApp',
    ]);
    const serverFiles = listSourceFiles(path.join(root, 'src/modules')).filter(
      (file) => /[/\\](server|server-functions)\.ts$/.test(file)
    );

    const violations = findServerFunctionExports(serverFiles)
      .filter(({ name }) => !publicServerFunctions.has(name))
      .filter(
        ({ source }) =>
          !source.includes('createServerFunctionInvoker') ||
          !(
            source.includes('withProtectedContext') ||
            source.includes('withProtectedMutation')
          )
      )
      .map(({ file, name }) => `${path.relative(root, file)}:${name}`);

    expect(violations).toEqual([]);
  });

  it('confines Better Auth imports to auth boundaries', () => {
    const files = listSourceFiles(path.join(root, 'src')).filter((file) => {
      const relative = path.relative(root, file);
      return (
        !relative.startsWith(
          path.join('src', 'modules', 'auth', 'infrastructure', 'better-auth')
        ) &&
        relative !==
          path.join(
            'src',
            'modules',
            'auth',
            'presentation',
            'better-auth-client.ts'
          )
      );
    });

    expect(
      findImportViolations(files, /from\s+['"]better-auth(?:\/[^'"]*)?['"]/g)
    ).toEqual([]);
  });

  it('keeps provider session tokens out of app-facing code', () => {
    const files = listSourceFiles(path.join(root, 'src')).filter((file) => {
      const relative = path.relative(root, file);
      return !relative.startsWith(
        path.join('src', 'modules', 'auth', 'infrastructure', 'better-auth')
      );
    });

    expect(findImportViolations(files, /\bproviderToken\b/g)).toEqual([]);
  });

  it('reserves WorkOS SDK imports for the future WorkOS adapter', () => {
    const files = listSourceFiles(path.join(root, 'src')).filter((file) => {
      const relative = path.relative(root, file);
      return !relative.startsWith(
        path.join('src', 'modules', 'auth', 'infrastructure', 'workos')
      );
    });

    expect(findImportViolations(files, /from\s+['"]@workos\//g)).toEqual([]);
  });

  it('keeps business code off the Sentry SDK', () => {
    const files = fs
      .readdirSync(path.join(root, 'src/modules'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const moduleRoot = path.join(root, 'src/modules', entry.name);
        return [
          ...listSourceFiles(path.join(moduleRoot, 'domain')),
          ...listSourceFiles(path.join(moduleRoot, 'application')),
        ];
      });

    expect(findImportViolations(files, /from\s+['"]@sentry\//g)).toEqual([]);
  });

  it('keeps module application flow on Result instead of thrown errors', () => {
    const applicationFiles = fs
      .readdirSync(path.join(root, 'src/modules'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) =>
        listSourceFiles(
          path.join(root, 'src/modules', entry.name, 'application')
        )
      );

    expect(findImportViolations(applicationFiles, /\bthrow\b/g)).toEqual([]);

    const tryCatchFiles = findImportViolations(
      applicationFiles,
      /\btry\s*\{[\s\S]*?\}\s*catch\b/g
    );
    const unexpectedTryCatchFiles = tryCatchFiles.filter(
      (file) => !transactionApplicationErrorBoundaryFiles.has(file)
    );

    expect(unexpectedTryCatchFiles).toEqual([]);
    expect(tryCatchFiles.sort()).toEqual(
      [...transactionApplicationErrorBoundaryFiles].sort()
    );
  });
});
