import { spawnSync } from 'node:child_process';

export const runGit = (args) => {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
};

export const runGitStrict = (args) => {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
  }

  return result.stdout;
};

export const resolveBase = () => {
  const mainBase = runGit(['merge-base', 'HEAD', 'origin/main']);
  if (mainBase) {
    return mainBase;
  }

  const masterBase = runGit(['merge-base', 'HEAD', 'origin/master']);
  if (masterBase) {
    return masterBase;
  }

  const previousCommit = runGit(['rev-parse', 'HEAD~1']);
  if (previousCommit) {
    return previousCommit;
  }

  return 'HEAD';
};

export const listChangedFiles = (base) => {
  const committed = runGit([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    `${base}...HEAD`,
  ]);
  const staged = runGit([
    'diff',
    '--name-only',
    '--cached',
    '--diff-filter=ACMR',
  ]);
  const unstaged = runGit(['diff', '--name-only', '--diff-filter=ACMR']);

  return new Set(
    [
      ...(committed?.split('\n') ?? []),
      ...(staged?.split('\n') ?? []),
      ...(unstaged?.split('\n') ?? []),
    ]
      .map((file) => file.trim())
      .filter(Boolean)
  );
};
