import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const sourceFileExtensions = new Set(['.ts', '.tsx']);

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

describe('strict modular monolith layout', () => {
  it('keeps legacy feature and shared roots removed', () => {
    expect(fs.existsSync(path.join(root, 'src/features'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/components'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/hooks'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/lib'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/layout'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/emails'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/platform'))).toBe(true);
  });

  it('requires module public split barrels where modules expose adapters', () => {
    for (const moduleName of [
      'account',
      'auth',
      'book',
      'genre',
      'runtime-config',
      'user',
    ]) {
      const moduleRoot = path.join(root, 'src/modules', moduleName);
      expect(fs.existsSync(path.join(moduleRoot, 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(moduleRoot, 'presentation.ts'))).toBe(
        true
      );
      expect(fs.existsSync(path.join(moduleRoot, 'server.ts'))).toBe(true);
      expect(fs.existsSync(path.join(moduleRoot, 'client.ts'))).toBe(true);
    }
  });

  it('keeps core business modules in vertical hexagonal slices', () => {
    for (const moduleName of ['account', 'book', 'genre', 'user']) {
      const moduleRoot = path.join(root, 'src/modules', moduleName);

      for (const expectedPath of [
        'domain',
        path.join('application', 'use-cases'),
        path.join('application', 'ports'),
        path.join('infrastructure', 'drizzle'),
        path.join('transport', 'http'),
        'factory.ts',
        'index.ts',
      ]) {
        expect(fs.existsSync(path.join(moduleRoot, expectedPath))).toBe(true);
      }
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

  it('keeps routes on module public APIs', () => {
    expect(
      findImportViolations(
        listSourceFiles(path.join(root, 'src/routes')),
        /from\s+['"]@\/modules\/[^/'"]+\/(?!(?:index|presentation|server|client)(?:\.[^/'"]+)?(?:['"]|$))[^'"]+['"]/g
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
    ).filter((file) => /[/\\](server|server-functions)\.ts$/.test(file));
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
        !relative.startsWith(`src${path.sep}modules${path.sep}auth`) &&
        relative !== path.join('src', 'composition', 'auth.ts')
      );
    });

    expect(
      findImportViolations(files, /from\s+['"]better-auth(?:\/[^'"]*)?['"]/g)
    ).toEqual([]);
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
});
