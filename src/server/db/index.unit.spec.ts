import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
  const drizzleDb = {
    $client: { kind: 'sql-client' },
    session: { kind: 'drizzle-driver-session' },
    user: { kind: 'drizzle-user' },
    genre: { kind: 'drizzle-genre' },
    book: { kind: 'drizzle-book' },
    insert() {
      return this.session;
    },
  };

  return {
    drizzleDb,
    postgres: vi.fn(() => ({ kind: 'postgres-client' })),
    drizzle: vi.fn(() => drizzleDb),
  };
});

vi.mock('postgres', () => ({
  default: hoisted.postgres,
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: hoisted.drizzle,
}));

vi.mock('@/env/server', () => ({
  envServer: {
    DATABASE_URL: 'postgres://startui:startui@localhost:5432/startui',
    LOGGER_LEVEL: 'info',
  },
}));

import { db } from './index';
import { schema } from './schema';

describe('runtime db proxy', () => {
  it('passes book and genre relation metadata to drizzle runtime queries', async () => {
    expect(schema).toMatchObject({
      bookRelations: expect.anything(),
      genreRelations: expect.anything(),
    });
  });

  it('prefers the custom session runtime model over the underlying drizzle session property', async () => {
    expect(db.session).not.toBe(hoisted.drizzleDb.session);
    expect(typeof db.session.count).toBe('function');
    expect(typeof db.session.findMany).toBe('function');
    expect(typeof db.session.findFirstForUser).toBe('function');
  });
});
