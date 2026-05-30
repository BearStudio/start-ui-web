import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const resultsDir = path.join(root, 'test-results', 'codeql');
const dbDir = path.join(resultsDir, 'start-ui-web-db');
const extractionConfigPath = path.join(
  root,
  '.github',
  'codeql',
  'codeql-local-extraction.yml'
);
const queryPackDir = path.join(
  root,
  '.github',
  'codeql',
  'start-ui-web-queries'
);
const suitePath = path.join(queryPackDir, 'start-ui-web-codeql.qls');
const sarifPath = path.join(resultsDir, 'start-ui-web.sarif');

const command = process.argv[2];

const usage = `Usage: node scripts/run-codeql.mjs <db|analyze|test>

Install the CodeQL CLI first:
  https://github.com/github/codeql-cli-binaries/releases
`;

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });

  if (result.error?.code === 'ENOENT') {
    console.error('CodeQL CLI was not found on PATH.');
    console.error(usage);
    process.exit(127);
  }

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function ensureCodeql() {
  run('codeql', ['version']);
}

function installPackDependencies() {
  run('codeql', ['pack', 'install', queryPackDir]);
}

if (!['db', 'analyze', 'test'].includes(command)) {
  console.error(usage);
  process.exit(2);
}

mkdirSync(resultsDir, { recursive: true });
ensureCodeql();
installPackDependencies();

if (command === 'db') {
  run('codeql', [
    'database',
    'create',
    dbDir,
    '--language=javascript-typescript',
    '--source-root',
    root,
    '--codescanning-config',
    extractionConfigPath,
    '--overwrite',
  ]);
}

if (command === 'analyze') {
  if (!existsSync(dbDir)) {
    console.error(`CodeQL database not found at ${dbDir}`);
    console.error('Run `pnpm codeql:db` first.');
    process.exit(2);
  }

  run('codeql', [
    'database',
    'analyze',
    dbDir,
    suitePath,
    '--format=sarifv2.1.0',
    `--output=${sarifPath}`,
    '--rerun',
  ]);
}

if (command === 'test') {
  run('codeql', ['test', 'run', path.join(queryPackDir, 'test')]);
}
