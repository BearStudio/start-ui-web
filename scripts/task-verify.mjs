import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const runVisual = args.has('--visual');
const runChromiumE2e = args.has('--e2e-chromium');
const runBuild = args.has('--build');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportDir = path.resolve('test-results', 'task-verification', timestamp);

const steps = [
  {
    id: 'format-changed',
    command: 'pnpm',
    args: ['format:changed'],
  },
  {
    id: 'check',
    command: 'pnpm',
    args: ['check'],
  },
  {
    id: 'test-affected',
    command: 'pnpm',
    args: ['test:affected'],
  },
  ...(runVisual
    ? [
        {
          id: 'e2e-visual',
          command: 'pnpm',
          args: ['test:e2e:visual'],
        },
      ]
    : []),
  ...(runChromiumE2e
    ? [
        {
          id: 'e2e-chromium',
          command: 'pnpm',
          args: ['test:e2e:chromium'],
        },
      ]
    : []),
  ...(runBuild
    ? [
        {
          id: 'build',
          command: 'pnpm',
          args: ['build'],
        },
      ]
    : []),
];

const formatCommand = ({ command, args }) =>
  [command, ...args]
    .map((part) => (part.includes(' ') ? `"${part}"` : part))
    .join(' ');

const runStep = async (step) =>
  new Promise((resolve) => {
    const startedAt = new Date();
    const logPath = path.join(reportDir, `${step.id}.log`);
    const log = createWriteStream(logPath, { flags: 'a' });

    log.write(`$ ${formatCommand(step)}\n\n`);
    console.log(`\n$ ${formatCommand(step)}`);

    const child = spawn(step.command, step.args, {
      env: process.env,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      log.write(chunk);
    });

    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      log.write(chunk);
    });

    child.on('error', (error) => {
      const message = `${error.message}\n`;
      process.stderr.write(message);
      log.write(message);
    });

    child.on('close', (code, signal) => {
      const finishedAt = new Date();
      log.end(
        `\nexitCode=${code ?? 'null'} signal=${signal ?? 'null'} durationMs=${
          finishedAt.getTime() - startedAt.getTime()
        }\n`
      );
      resolve({
        ...step,
        code,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        finishedAt,
        logPath,
        signal,
        startedAt,
      });
    });
  });

const writeSummary = async (results) => {
  const failed = results.find((result) => result.code !== 0);
  const lines = [
    '# Task Verification Report',
    '',
    `- Started: ${
      results[0]?.startedAt.toISOString() ?? new Date().toISOString()
    }`,
    `- Finished: ${new Date().toISOString()}`,
    `- Status: ${failed ? 'failed' : 'passed'}`,
    `- Directory: ${reportDir}`,
    '',
    '## Steps',
    '',
    ...results.flatMap((result) => [
      `- ${result.code === 0 ? 'PASS' : 'FAIL'} \`${formatCommand(result)}\``,
      `  - Duration: ${result.durationMs}ms`,
      `  - Log: ${path.relative(process.cwd(), result.logPath)}`,
    ]),
    '',
    '## Artifact Conventions',
    '',
    '- Playwright traces, screenshots, and videos remain under `test-results/`.',
    '- This report directory stores the command logs for the task verification run.',
    '- If a command fails, inspect the step log first, then the linked Playwright artifacts.',
    '',
  ];

  const summaryPath = path.join(reportDir, 'summary.md');
  await writeFile(summaryPath, lines.join('\n'));
  return { failed, summaryPath };
};

await mkdir(reportDir, { recursive: true });

const results = [];
for (const step of steps) {
  const result = await runStep(step);
  results.push(result);

  if (result.code !== 0) {
    break;
  }
}

const { failed, summaryPath } = await writeSummary(results);

console.log(`\nVerification report: ${summaryPath}`);

if (failed) {
  process.exitCode = failed.code ?? 1;
}
