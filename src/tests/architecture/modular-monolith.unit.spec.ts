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

describe('strict modular monolith layout', () => {
  it('keeps legacy feature and shared roots removed', () => {
    expect(fs.existsSync(path.join(root, 'src/features'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/components'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/hooks'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/lib'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/layout'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/platform'))).toBe(true);
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
});
