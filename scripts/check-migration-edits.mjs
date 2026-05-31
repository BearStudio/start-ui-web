import { resolveBase, runGitStrict } from './lib/git-utils.mjs';

const MIGRATIONS_DIR = 'drizzle/migrations';
const SCHEMA_PATHS = [
  'src/modules/kernel/infrastructure/db/schema.ts',
  'src/modules/kernel/infrastructure/db/schema',
];
const SQL_MIGRATION_PATTERN = /^drizzle\/migrations\/.*\.sql$/;

const splitNul = (output) => output.split('\0').filter(Boolean);

const parseNameStatus = (output, source) => {
  const fields = splitNul(output);
  const changes = [];

  for (let index = 0; index < fields.length; index += 1) {
    const rawStatus = fields[index];
    const status = rawStatus?.[0];

    if (!rawStatus || !status) continue;

    if (status === 'R' || status === 'C') {
      const oldPath = fields[index + 1];
      const filePath = fields[index + 2];
      index += 2;
      if (oldPath && filePath) {
        changes.push({ source, status, rawStatus, oldPath, filePath });
      }
      continue;
    }

    const filePath = fields[index + 1];
    index += 1;
    if (filePath) {
      changes.push({ source, status, rawStatus, filePath });
    }
  }

  return changes;
};

const listBaseSqlMigrations = (base) =>
  new Set(
    splitNul(
      runGitStrict([
        'ls-tree',
        '-r',
        '-z',
        '--name-only',
        base,
        '--',
        MIGRATIONS_DIR,
      ])
    ).filter((filePath) => SQL_MIGRATION_PATTERN.test(filePath))
  );

const collectMigrationChanges = (base) => [
  ...parseNameStatus(
    runGitStrict([
      'diff',
      '--name-status',
      '-z',
      '--find-renames',
      `${base}...HEAD`,
      '--',
      MIGRATIONS_DIR,
    ]),
    'committed'
  ),
  ...parseNameStatus(
    runGitStrict([
      'diff',
      '--name-status',
      '-z',
      '--find-renames',
      '--cached',
      '--',
      MIGRATIONS_DIR,
    ]),
    'staged'
  ),
  ...parseNameStatus(
    runGitStrict([
      'diff',
      '--name-status',
      '-z',
      '--find-renames',
      '--',
      MIGRATIONS_DIR,
    ]),
    'unstaged'
  ),
];

const collectUntrackedSqlMigrations = () =>
  splitNul(
    runGitStrict([
      'ls-files',
      '--others',
      '--exclude-standard',
      '-z',
      '--',
      MIGRATIONS_DIR,
    ])
  ).filter((filePath) => SQL_MIGRATION_PATTERN.test(filePath));

const hasSchemaChanges = (base) => {
  const committed = splitNul(
    runGitStrict([
      'diff',
      '--name-only',
      '-z',
      `${base}...HEAD`,
      '--',
      ...SCHEMA_PATHS,
    ])
  ).length;
  const staged = splitNul(
    runGitStrict([
      'diff',
      '--name-only',
      '-z',
      '--cached',
      '--',
      ...SCHEMA_PATHS,
    ])
  ).length;
  const unstaged = splitNul(
    runGitStrict(['diff', '--name-only', '-z', '--', ...SCHEMA_PATHS])
  ).length;

  return committed > 0 || staged > 0 || unstaged > 0;
};

const formatChange = (change) => {
  if (change.oldPath) {
    return `[${change.source}] ${change.rawStatus} ${change.oldPath} -> ${change.filePath}`;
  }

  return `[${change.source}] ${change.rawStatus} ${change.filePath}`;
};

const addUnique = (map, key, value) => {
  if (!map.has(key)) {
    map.set(key, value);
  }
};

const base = resolveBase();
const baseSqlMigrations = listBaseSqlMigrations(base);
const migrationChanges = collectMigrationChanges(base);
const untrackedSqlMigrations = collectUntrackedSqlMigrations();
const immutableMigrationViolations = new Map();
const newMigrationPaths = new Map();

for (const change of migrationChanges) {
  const filePathIsSql = SQL_MIGRATION_PATTERN.test(change.filePath);
  const oldPathIsSql =
    change.oldPath !== undefined && SQL_MIGRATION_PATTERN.test(change.oldPath);

  if (!filePathIsSql && !oldPathIsSql) continue;

  if (
    oldPathIsSql &&
    change.oldPath !== undefined &&
    baseSqlMigrations.has(change.oldPath)
  ) {
    addUnique(
      immutableMigrationViolations,
      `${change.source}:${change.rawStatus}:${change.oldPath}:${change.filePath}`,
      formatChange(change)
    );
    continue;
  }

  if (filePathIsSql && baseSqlMigrations.has(change.filePath)) {
    addUnique(
      immutableMigrationViolations,
      `${change.source}:${change.rawStatus}:${change.filePath}`,
      formatChange(change)
    );
    continue;
  }

  if (filePathIsSql && ['A', 'C', 'M'].includes(change.status)) {
    addUnique(newMigrationPaths, change.filePath, formatChange(change));
  }
}

for (const filePath of untrackedSqlMigrations) {
  addUnique(newMigrationPaths, filePath, `[untracked] A ${filePath}`);
}

const schemaChanged = hasSchemaChanges(base);
const newMigrationViolations = schemaChanged
  ? []
  : [...newMigrationPaths.values()];

if (
  immutableMigrationViolations.size === 0 &&
  newMigrationViolations.length === 0
) {
  console.log('Migration edit guard passed.');
  process.exit(0);
}

console.error('Migration edit guard failed.');

if (immutableMigrationViolations.size > 0) {
  console.error(
    '\nExisting migration SQL files under drizzle/migrations may not be modified, deleted, or renamed:'
  );
  for (const violation of immutableMigrationViolations.values()) {
    console.error(`- ${violation}`);
  }
}

if (newMigrationViolations.length > 0) {
  console.error(
    `\nNew migration SQL files require schema changes in ${SCHEMA_PATHS.join(
      ' or '
    )}:`
  );
  for (const violation of newMigrationViolations) {
    console.error(`- ${violation}`);
  }
}

process.exit(1);
