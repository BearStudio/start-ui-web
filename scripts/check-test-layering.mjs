import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const testRoot = path.join(root, 'tests');
const sourceFilePattern = /\.[cm]?[jt]sx?$/;
const publicModuleFiles = new Set([
  'index',
  'server',
  'client',
  'presentation',
]);

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listFiles(filePath);
    if (!entry.isFile()) return [];

    return [filePath];
  });
}

function toProjectPath(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function readImportSpecifiers(source) {
  const specifiers = new Set();
  const importFromPattern =
    /\b(?:import|export)\s+(?:type\s+)?[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
  const sideEffectPattern = /\bimport\s+['"]([^'"]+)['"]/g;

  for (const match of source.matchAll(importFromPattern)) {
    specifiers.add(match[1]);
  }

  for (const match of source.matchAll(sideEffectPattern)) {
    specifiers.add(match[1]);
  }

  return [...specifiers];
}

function resolveLocalImport(importer, specifier) {
  if (specifier.startsWith('@/')) {
    return path.resolve(root, 'src', specifier.slice(2));
  }

  if (specifier.startsWith('@tests/')) {
    return path.resolve(root, 'tests', specifier.slice(7));
  }

  if (specifier.startsWith('.')) {
    return path.resolve(path.dirname(importer), specifier);
  }

  return null;
}

function moduleImportViolation(resolvedImport) {
  if (!resolvedImport) return null;

  const projectPath = toProjectPath(resolvedImport);
  const match = /^src\/modules\/([^/]+)(?:\/(.+))?$/.exec(projectPath);
  if (!match) return null;

  const [, moduleName, modulePath = ''] = match;
  if (moduleName === 'kernel') return null;
  if (!modulePath) return null;

  const [firstSegment = ''] = modulePath.split('/');
  const publicName = firstSegment.replace(/\.[cm]?[jt]sx?$/, '');
  const isPublicFile =
    publicModuleFiles.has(publicName) &&
    (firstSegment === modulePath || /^\w+\.[cm]?[jt]sx?$/.test(modulePath));

  if (isPublicFile) return null;

  return `workflow integration tests must import ${moduleName} through index.ts, server.ts, client.ts, or presentation.ts`;
}

const failures = [];
const sourceFiles = [...listFiles(sourceRoot), ...listFiles(testRoot)].filter(
  (filePath) => sourceFilePattern.test(filePath)
);

for (const filePath of sourceFiles) {
  const projectPath = toProjectPath(filePath);
  const source = readFileSync(filePath, 'utf8');
  const importSpecifiers = readImportSpecifiers(source);

  if (
    projectPath !== 'tests/support/property-testing.ts' &&
    importSpecifiers.includes('@fast-check/vitest')
  ) {
    failures.push(
      `${projectPath}: import property-test helpers from @tests/support/property-testing instead of @fast-check/vitest`
    );
  }

  if (
    /^tests\/unit\/modules\/[^/]+\/domain\/__tests__\/[^/]+\.unit\.spec\.tsx?$/.test(
      projectPath
    ) &&
    importSpecifiers.includes('@tests/support/property-testing')
  ) {
    failures.push(
      `${projectPath}: property-based domain unit tests must sit next to the source file they test`
    );
  }

  if (
    projectPath.startsWith('tests/integration/') &&
    !projectPath.endsWith('.integration.test.ts')
  ) {
    failures.push(
      `${projectPath}: integration tests must end with .integration.test.ts`
    );
  }

  if (
    projectPath.endsWith('.workflow.integration.test.ts') ||
    projectPath.endsWith('.workflow.integration.test.tsx')
  ) {
    for (const specifier of importSpecifiers) {
      const violation = moduleImportViolation(
        resolveLocalImport(filePath, specifier)
      );

      if (violation) {
        failures.push(`${projectPath}: ${violation} (${specifier})`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Test layering check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Test layering check passed.');
