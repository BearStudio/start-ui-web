import { PrismaClient } from '@prisma/client';

import { envServer } from '@/env/server';

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
    log: levels[envServer.LOGGER_LEVEL],
  });

if (import.meta.env.DEV) globalForPrisma.prisma = db;
