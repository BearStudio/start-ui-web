import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveTrustedTool } from './trusted-tool';

const DEPENDENCY_CRUISE_ROOT_CANDIDATES = ['src', 'tests', 'scripts'] as const;
const GIT_COMMAND = 'git';

const GLOBAL_CONFIG_FILES = new Set([
  'vitest.config.ts',
  'vitest.postgres.config.ts',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tests/setup.base.ts',
  'tests/setup.browser.ts',
  'tests/server/test-setup.ts',
  'tests/server/pglite-global-setup.ts',
]);

const RUNNABLE_TEST_FILE_PATTERN =
  /^tests\/(?:unit|browser|integration|architecture|security)\/.*\.(?:test|spec)\.[cm]?[jt]sx?$/;
const POSTGRES_INTEGRATION_TEST_PATTERN =
  /\.postgres\.integration\.test\.[cm]?[jt]sx?$/;
const SOURCE_FILE_PATTERN = /^(?:src|scripts)\/.*\.[cm]?[jt]sx?$/;
const DECLARATION_FILE_PATTERN = /\.d\.[cm]?ts$/;
const TEST_SUPPORT_PATTERN = /^tests\/(?:support|mocks|server)\//;
const TESTISH_SOURCE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
const SOURCE_EXTENSION_PATTERN = /\.[cm]?[jt]sx?$/;

export const USAGE = `Usage: pnpm exec tsx scripts/affected-tests.ts [options]

Options:
  --base <revision>   Git revision to diff against (default: compares working tree)
  --run               Execute vitest with affected tests
  --verbose           Show discovery details per test file
  --json              Print JSON output
  --summary           Print human-readable summary output
  --help              Show this help message`;

export class AffectedTestsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AffectedTestsError';
  }
}

export type CliOptions = {
  base?: string;
  help: boolean;
  json: boolean;
  run: boolean;
  summary: boolean;
  verbose: boolean;
};

export type ParseCliArgumentsResult =
  | { ok: true; options: CliOptions }
  | { ok: false; error: string };

export type ClassifiedChangedFiles = {
  directTestFiles: string[];
  excludedFiles: string[];
  globalConfigChanged: boolean;
  globalConfigFiles: string[];
  sourceFiles: string[];
  testSupportFiles: string[];
};

type Dependency = {
  module?: string;
  resolved?: string;
};

type DependencyCruiserModule = {
  dependencies?: Dependency[];
  source: string;
};

export type DependencyCruiserReport = {
  modules: DependencyCruiserModule[];
};

export type GraphDiscoveryResult = {
  consideredSourceFiles: string[];
  testFiles: string[];
};

export type AffectedTestsResult = {
  changedFiles: string[];
  consideredSourceFiles: string[];
  dependencyCruiserFailed: boolean;
  directTestFiles: string[];
  excludedChangedFiles: string[];
  rootsCruised: string[];
  runAll: boolean;
  runAllReason?: string;
  strategyAFiles: string[];
  strategyBFiles: string[];
  testFiles: string[];
  warnings: string[];
};

export type FindAffectedTestsOptions = {
  allTestFiles?: string[];
  base?: string;
  changedFiles?: string[];
  cwd?: string;
  dependencyCruiser?: (
    roots: string[],
    cwd: string
  ) => Promise<DependencyCruiserReport>;
};

export type GitRunner = (args: string[], description: string) => string;

export type MainDependencies = {
  findAffectedTests?: (options: {
    base?: string;
  }) => Promise<AffectedTestsResult>;
  runVitest?: (testFiles: string[]) => Promise<number>;
  stderr?: (message: string) => void;
  stdout?: (message: string) => void;
};

type BooleanCliOption = Exclude<keyof CliOptions, 'base'>;

const BOOLEAN_CLI_FLAGS = {
  '--help': 'help',
  '--json': 'json',
  '--run': 'run',
  '--summary': 'summary',
  '--verbose': 'verbose',
} as const satisfies Record<string, BooleanCliOption>;

const isBooleanCliFlag = (arg: string): arg is keyof typeof BOOLEAN_CLI_FLAGS =>
  arg in BOOLEAN_CLI_FLAGS;

const parseBaseOption = (args: string[], index: number) => {
  const value = args[index + 1];
  if (!value || value === '--' || value.startsWith('--')) {
    return { ok: false as const, error: 'Missing value for --base.' };
  }

  return { ok: true as const, value };
};

export const parseCliArguments = (args: string[]): ParseCliArgumentsResult => {
  const options: CliOptions = {
    help: false,
    json: false,
    run: false,
    summary: false,
    verbose: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) continue;
    if (arg === '--') continue;

    if (arg === '--base') {
      const parsed = parseBaseOption(args, index);
      if (!parsed.ok) return { ok: false, error: parsed.error };

      options.base = parsed.value;
      index += 1;
      continue;
    }

    if (isBooleanCliFlag(arg)) {
      options[BOOLEAN_CLI_FLAGS[arg]] = true;
      continue;
    }

    return { ok: false, error: `Unknown option: ${arg}` };
  }

  if (options.json && options.summary) {
    return { ok: false, error: 'Use either --json or --summary, not both.' };
  }

  return { ok: true, options };
};

export const normalizePath = (filePath: string) => {
  const normalized = path.posix.normalize(
    filePath.replaceAll('\\', '/').trim()
  );
  return normalized === '.' ? '' : normalized.replace(/^\.\//, '');
};

export const deduplicateAndSort = (filePaths: string[]) =>
  [...new Set(filePaths.map(normalizePath).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right)
  );

export const parseNullDelimitedPaths = (output: string) =>
  deduplicateAndSort(output.split('\0'));

const runGitStrict =
  (cwd: string): GitRunner =>
  (args, description) => {
    const result = spawnSync(resolveTrustedTool(GIT_COMMAND), args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (result.error) {
      throw new AffectedTestsError(
        `${description} failed: ${result.error.message}`
      );
    }

    if (result.status !== 0) {
      throw new AffectedTestsError(
        `${description} failed: ${result.stderr.trim()}`
      );
    }

    return result.stdout;
  };

export const collectChangedFilesFromGit = ({
  base,
  cwd = process.cwd(),
  runGit = runGitStrict(cwd),
}: {
  base?: string;
  cwd?: string;
  runGit?: GitRunner;
} = {}) => {
  if (base) {
    return parseNullDelimitedPaths(
      runGit(
        ['diff', `${base}...HEAD`, '--name-only', '--diff-filter=ACMRTD', '-z'],
        `git diff ${base}...HEAD`
      )
    );
  }

  return deduplicateAndSort([
    ...parseNullDelimitedPaths(
      runGit(['diff', '--name-only', '--diff-filter=ACMRTD', '-z'], 'git diff')
    ),
    ...parseNullDelimitedPaths(
      runGit(
        ['diff', '--cached', '--name-only', '--diff-filter=ACMRTD', '-z'],
        'git diff --cached'
      )
    ),
    ...parseNullDelimitedPaths(
      runGit(
        ['ls-files', '--others', '--exclude-standard', '-z'],
        'git ls-files --others'
      )
    ),
  ]);
};

export const isRunnableVitestTestFile = (filePath: string) => {
  const normalized = normalizePath(filePath);
  return (
    RUNNABLE_TEST_FILE_PATTERN.test(normalized) &&
    !POSTGRES_INTEGRATION_TEST_PATTERN.test(normalized)
  );
};

export const isSourceFile = (filePath: string) => {
  const normalized = normalizePath(filePath);
  return (
    SOURCE_FILE_PATTERN.test(normalized) &&
    !DECLARATION_FILE_PATTERN.test(normalized) &&
    !TESTISH_SOURCE_PATTERN.test(normalized)
  );
};

export const isTestSupportFile = (filePath: string) => {
  const normalized = normalizePath(filePath);
  return (
    !isRunnableVitestTestFile(normalized) &&
    (TEST_SUPPORT_PATTERN.test(normalized) ||
      normalized === 'tests/utils.tsx' ||
      normalized === 'tests/vitest.d.ts')
  );
};

export const classifyChangedFiles = (
  changedFiles: string[]
): ClassifiedChangedFiles => {
  const classified: ClassifiedChangedFiles = {
    directTestFiles: [],
    excludedFiles: [],
    globalConfigChanged: false,
    globalConfigFiles: [],
    sourceFiles: [],
    testSupportFiles: [],
  };

  for (const filePath of deduplicateAndSort(changedFiles)) {
    if (GLOBAL_CONFIG_FILES.has(filePath)) {
      classified.globalConfigChanged = true;
      classified.globalConfigFiles.push(filePath);
    } else if (isRunnableVitestTestFile(filePath)) {
      classified.directTestFiles.push(filePath);
    } else if (isSourceFile(filePath)) {
      classified.sourceFiles.push(filePath);
    } else if (isTestSupportFile(filePath)) {
      classified.testSupportFiles.push(filePath);
    } else {
      classified.excludedFiles.push(filePath);
    }
  }

  return classified;
};

export const stripRouteGroupParens = (filePath: string) =>
  filePath
    .split('/')
    .map((segment) => {
      const match = /^\((.+)\)$/.exec(segment);
      return match?.[1] ?? segment;
    })
    .join('/');

const removeSourcePrefix = (filePath: string) => {
  if (filePath.startsWith('src/')) return filePath.slice('src/'.length);
  return filePath;
};

const testSuffixesForKind = (kind: 'browser' | 'integration' | 'unit') => {
  if (kind === 'integration') {
    return [
      '.integration.test.ts',
      '.integration.spec.ts',
      '.integration.test.tsx',
      '.integration.spec.tsx',
    ];
  }

  return [
    `.${kind}.test.ts`,
    `.${kind}.spec.ts`,
    `.${kind}.test.tsx`,
    `.${kind}.spec.tsx`,
  ];
};

const addMirrorCandidates = ({
  base,
  basename,
  candidates,
  directory,
  kind,
}: {
  base: string;
  basename: string;
  candidates: string[];
  directory: string;
  kind: 'browser' | 'integration' | 'unit';
}) => {
  for (const suffix of testSuffixesForKind(kind)) {
    candidates.push(
      `tests/${kind}/${base}${suffix}`,
      `tests/${kind}/${directory}/__tests__/${basename}${suffix}`
    );
  }
};

export const computeMirrorTestPaths = (sourceFiles: string[]) => {
  const candidates: string[] = [];

  for (const sourceFile of deduplicateAndSort(sourceFiles)) {
    const sourceBase = removeSourcePrefix(
      sourceFile.replace(SOURCE_EXTENSION_PATTERN, '')
    );
    const sourceBases = deduplicateAndSort([
      sourceBase,
      stripRouteGroupParens(sourceBase),
    ]);

    for (const base of sourceBases) {
      const directory = path.posix.dirname(base);
      const basename = path.posix.basename(base);

      addMirrorCandidates({
        base,
        basename,
        candidates,
        directory,
        kind: 'unit',
      });
      addMirrorCandidates({
        base,
        basename,
        candidates,
        directory,
        kind: 'browser',
      });
      addMirrorCandidates({
        base,
        basename,
        candidates,
        directory,
        kind: 'integration',
      });
    }
  }

  return deduplicateAndSort(candidates);
};

export const filterExistingFiles = (filePaths: string[], cwd = process.cwd()) =>
  deduplicateAndSort(filePaths).filter((filePath) =>
    existsSync(path.join(cwd, filePath))
  );

export const collectAllRunnableVitestTestFiles = (
  cwd = process.cwd(),
  root = 'tests'
) => {
  const rootPath = path.join(cwd, root);
  if (!existsSync(rootPath)) return [];

  const testFiles: string[] = [];
  const visit = (relativeDirectory: string) => {
    const absoluteDirectory = path.join(cwd, relativeDirectory);
    for (const entry of readdirSync(absoluteDirectory, {
      withFileTypes: true,
    })) {
      const relativePath = `${relativeDirectory}/${entry.name}`;
      if (entry.isDirectory()) {
        visit(relativePath);
      } else if (entry.isFile() && isRunnableVitestTestFile(relativePath)) {
        testFiles.push(relativePath);
      }
    }
  };

  visit(root);

  return deduplicateAndSort(testFiles);
};

export const collectExistingCruiseRoots = (
  cwd = process.cwd(),
  candidates: readonly string[] = DEPENDENCY_CRUISE_ROOT_CANDIDATES
) => candidates.filter((candidate) => existsSync(path.join(cwd, candidate)));

export const runDependencyCruiserWithApi = async (
  roots: string[],
  cwd = process.cwd()
): Promise<DependencyCruiserReport> => {
  const options = await extractDepcruiseOptions(
    path.resolve(cwd, '.dependency-cruiser.cjs')
  );
  const result = await cruise(roots, options);
  const output = result.output as DependencyCruiserReport | undefined;

  if (!output?.modules) {
    throw new AffectedTestsError(
      'dependency-cruiser returned no module graph.'
    );
  }

  return output;
};

const isWorkspaceGraphPath = (filePath: string) => {
  const normalized = normalizePath(filePath);
  return (
    normalized.startsWith('src/') ||
    normalized.startsWith('tests/') ||
    normalized.startsWith('scripts/')
  );
};

export const collectWorkspaceModules = (report: DependencyCruiserReport) =>
  new Set(
    report.modules
      .map((module) => normalizePath(module.source))
      .filter(isWorkspaceGraphPath)
  );

export const buildReverseDependencies = (report: DependencyCruiserReport) => {
  const reverseDependencies = new Map<string, Set<string>>();

  for (const module of report.modules) {
    const source = normalizePath(module.source);
    if (!isWorkspaceGraphPath(source)) continue;

    for (const dependency of module.dependencies ?? []) {
      if (!dependency.resolved) continue;

      const resolved = normalizePath(dependency.resolved);
      if (!isWorkspaceGraphPath(resolved)) continue;

      const importers = reverseDependencies.get(resolved) ?? new Set<string>();
      importers.add(source);
      reverseDependencies.set(resolved, importers);
    }
  }

  return reverseDependencies;
};

export const findRelatedTestsInGraph = (
  changedFiles: string[],
  report: DependencyCruiserReport
): GraphDiscoveryResult => {
  const workspaceModules = collectWorkspaceModules(report);
  const reverseDependencies = buildReverseDependencies(report);
  const consideredSourceFiles = deduplicateAndSort(changedFiles).filter(
    (filePath) => workspaceModules.has(filePath)
  );
  const relatedTests = new Set<string>();
  const visited = new Set<string>();
  const queue = [...consideredSourceFiles];

  while (queue.length > 0) {
    const dependency = queue.shift();
    if (!dependency || visited.has(dependency)) continue;

    visited.add(dependency);

    for (const importer of reverseDependencies.get(dependency) ?? []) {
      if (isRunnableVitestTestFile(importer)) {
        relatedTests.add(importer);
      }

      if (!visited.has(importer)) {
        queue.push(importer);
      }
    }
  }

  return {
    consideredSourceFiles,
    testFiles: deduplicateAndSort([...relatedTests]),
  };
};

export const runStrategyB = (sourceFiles: string[], cwd = process.cwd()) =>
  filterExistingFiles(computeMirrorTestPaths(sourceFiles), cwd);

export const findAffectedTests = async ({
  allTestFiles,
  base,
  changedFiles,
  cwd = process.cwd(),
  dependencyCruiser = runDependencyCruiserWithApi,
}: FindAffectedTestsOptions = {}): Promise<AffectedTestsResult> => {
  const normalizedChangedFiles = deduplicateAndSort(
    changedFiles ?? collectChangedFilesFromGit({ base, cwd })
  );
  const classified = classifyChangedFiles(normalizedChangedFiles);

  if (classified.globalConfigChanged) {
    const runnableTestFiles =
      allTestFiles ?? collectAllRunnableVitestTestFiles(cwd);

    return {
      changedFiles: normalizedChangedFiles,
      consideredSourceFiles: [],
      dependencyCruiserFailed: false,
      directTestFiles: filterExistingFiles(classified.directTestFiles, cwd),
      excludedChangedFiles: classified.excludedFiles,
      rootsCruised: [],
      runAll: true,
      runAllReason: 'global config file changed',
      strategyAFiles: [],
      strategyBFiles: [],
      testFiles: runnableTestFiles,
      warnings: [],
    };
  }

  const rootsCruised = collectExistingCruiseRoots(cwd);
  const graphSeeds = deduplicateAndSort([
    ...classified.sourceFiles,
    ...classified.testSupportFiles,
  ]);
  let dependencyCruiserFailed = false;
  let strategyAFiles: string[] = [];
  let consideredSourceFiles: string[] = [];
  let workspaceModules = new Set<string>();
  const warnings: string[] = [];

  if (rootsCruised.length > 0 && graphSeeds.length > 0) {
    try {
      const report = await dependencyCruiser(rootsCruised, cwd);
      workspaceModules = collectWorkspaceModules(report);
      const graphResult = findRelatedTestsInGraph(graphSeeds, report);
      strategyAFiles = graphResult.testFiles;
      consideredSourceFiles = graphResult.consideredSourceFiles;
    } catch {
      dependencyCruiserFailed = true;
      warnings.push(
        'Warning: dependency-cruiser failed, continuing with mirror-path strategy only'
      );
    }
  }

  if (dependencyCruiserFailed && classified.testSupportFiles.length > 0) {
    return {
      changedFiles: normalizedChangedFiles,
      consideredSourceFiles: [],
      dependencyCruiserFailed,
      directTestFiles: filterExistingFiles(classified.directTestFiles, cwd),
      excludedChangedFiles: classified.excludedFiles,
      rootsCruised,
      runAll: true,
      runAllReason: 'dependency-cruiser failed for test support changes',
      strategyAFiles: [],
      strategyBFiles: [],
      testFiles: allTestFiles ?? collectAllRunnableVitestTestFiles(cwd),
      warnings,
    };
  }

  const strategyBFiles = runStrategyB(classified.sourceFiles, cwd);
  const directTestFiles = filterExistingFiles(classified.directTestFiles, cwd);
  const graphSeedFilesMissingFromGraph = graphSeeds.filter(
    (filePath) => !workspaceModules.has(filePath)
  );
  const excludedChangedFiles = deduplicateAndSort([
    ...classified.excludedFiles,
    ...graphSeedFilesMissingFromGraph,
  ]);
  const testFiles = filterExistingFiles(
    [...directTestFiles, ...strategyAFiles, ...strategyBFiles],
    cwd
  );

  return {
    changedFiles: normalizedChangedFiles,
    consideredSourceFiles,
    dependencyCruiserFailed,
    directTestFiles,
    excludedChangedFiles,
    rootsCruised,
    runAll: false,
    strategyAFiles,
    strategyBFiles,
    testFiles,
    warnings,
  };
};

const formatFileGroup = (files: string[]) =>
  files.map((filePath) => `#   ${filePath}`);

const formatVerboseSection = (label: string, files: string[]) => [
  `# ${label} (${files.length}):`,
  ...formatFileGroup(files),
];

export const formatSummary = (result: AffectedTestsResult) => {
  const lines = [
    `Run all: ${result.runAll ? 'yes' : 'no'}`,
    ...(result.runAllReason ? [`Run all reason: ${result.runAllReason}`] : []),
    `Dependency-cruiser failed: ${
      result.dependencyCruiserFailed ? 'yes' : 'no'
    }`,
    `Dependency-cruiser roots: ${result.rootsCruised.length}`,
    `Changed files: ${result.changedFiles.length}`,
    `Considered source files: ${result.consideredSourceFiles.length}`,
    `Excluded changed files: ${result.excludedChangedFiles.length}`,
    `Direct test changes: ${result.directTestFiles.length}`,
    `Strategy A tests: ${result.strategyAFiles.length}`,
    `Strategy B tests: ${result.strategyBFiles.length}`,
    `Total affected tests: ${result.testFiles.length}`,
    'Affected test paths:',
    ...result.testFiles.map((filePath) => `  ${filePath}`),
  ];

  if (result.excludedChangedFiles.length > 0) {
    lines.push(
      'Excluded changed paths:',
      ...result.excludedChangedFiles.map((filePath) => `  ${filePath}`)
    );
  }

  return lines.join('\n');
};

export const formatOutput = (
  result: AffectedTestsResult,
  options: Pick<CliOptions, 'json' | 'summary' | 'verbose'>
) => {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  if (options.summary) {
    return formatSummary(result);
  }

  if (!options.verbose) {
    return result.testFiles.join('\n');
  }

  return [
    ...formatVerboseSection('Direct test changes', result.directTestFiles),
    ...formatVerboseSection(
      'Strategy A - dependency-cruiser',
      result.strategyAFiles
    ),
    ...formatVerboseSection('Strategy B - mirror paths', result.strategyBFiles),
    ...result.testFiles,
  ].join('\n');
};

export const buildVitestCommand = (testFiles: string[]) => ({
  args: ['exec', 'vitest', 'run', '--passWithNoTests', ...testFiles],
  command: 'pnpm',
});

export const runVitest = (testFiles: string[]) =>
  new Promise<number>((resolve) => {
    const { args, command } = buildVitestCommand(testFiles);
    const child = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    child.on('error', (error) => {
      console.error(error.message);
      resolve(1);
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });

const writeOutput = (output: string, write: (message: string) => void) => {
  if (!output) return;
  write(output.endsWith('\n') ? output : `${output}\n`);
};

export const main = async (
  args = process.argv.slice(2),
  {
    findAffectedTests: findAffectedTestsDependency = findAffectedTests,
    runVitest: runVitestDependency = runVitest,
    stderr = (message) => process.stderr.write(message),
    stdout = (message) => process.stdout.write(message),
  }: MainDependencies = {}
) => {
  const parsed = parseCliArguments(args);
  if (!parsed.ok) {
    stderr(`${parsed.error}\n`);
    stderr(`${USAGE}\n`);
    return 2;
  }

  if (parsed.options.help) {
    stdout(`${USAGE}\n`);
    return 0;
  }

  try {
    const result = await findAffectedTestsDependency({
      base: parsed.options.base,
    });
    if (!parsed.options.json) {
      for (const warning of result.warnings) {
        stderr(`${warning}\n`);
      }
    }

    writeOutput(formatOutput(result, parsed.options), stdout);

    if (!parsed.options.run) {
      return 0;
    }

    if (result.testFiles.length === 0) {
      stderr('No affected test files found.\n');
      return 0;
    }

    return await runVitestDependency(result.testFiles);
  } catch (error) {
    stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
};

const entryPointPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;
const modulePath = fileURLToPath(import.meta.url);

export const isCliEntrypoint = (
  entryPointPath: string | undefined,
  modulePath: string,
  platform: typeof process.platform = process.platform
) => {
  if (!entryPointPath) return false;

  return platform === 'win32'
    ? entryPointPath.toLowerCase() === modulePath.toLowerCase()
    : entryPointPath === modulePath;
};

if (isCliEntrypoint(entryPointPath, modulePath)) {
  process.exitCode = await main();
}
