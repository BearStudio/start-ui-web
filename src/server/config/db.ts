import { PrismaClient } from '@prisma/client';

import { env } from '@/env.mjs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const levels = {
  trace: ['query', 'error', 'warn', 'info'],
  debug: ['error', 'warn', 'info'],
  info: ['error', 'warn', 'info'],
  warn: ['error', 'warn'],
  error: ['error'],
  fatal: ['error'],
} satisfies Record<string, ('query' | 'error' | 'warn' | 'info')[]>;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: levels[env.LOGGER_LEVEL],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
