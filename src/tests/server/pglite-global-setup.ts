import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { TestProject } from 'vitest/node';

import { pgliteTestDatabaseUrlContextKey } from './pglite-context';
import { makeTestDatabaseUrl } from './test-database-url';

const migrationsDirectory = path.resolve(process.cwd(), 'drizzle/migrations');

async function readMigrationSql() {
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const migrations = await Promise.all(
    migrationFiles.map((migrationFile) =>
      readFile(path.join(migrationsDirectory, migrationFile), 'utf8')
    )
  );

  return migrations
    .map((migration) => migration.replaceAll('--> statement-breakpoint', ''))
    .join('\n');
}

export async function setup(project: TestProject) {
  const pglite = new PGlite('memory://', { extensions: { pgcrypto } });
  await pglite.waitReady;
  await pglite.exec('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await pglite.exec(await readMigrationSql());

  const server = new PGLiteSocketServer({
    db: pglite,
    host: '127.0.0.1',
    port: 0,
    maxConnections: 16,
  });

  await server.start();

  project.provide(
    pgliteTestDatabaseUrlContextKey,
    makeTestDatabaseUrl({
      credentialLabel: 'pglite',
      databaseName: 'postgres',
      host: server.getServerConn(),
      port: null,
      protocol: 'postgresql',
    })
  );

  return async () => {
    await server.stop();
    await pglite.close();
  };
}
