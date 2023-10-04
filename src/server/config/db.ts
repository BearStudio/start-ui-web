import { PrismaClient } from '@prisma/client';
import { LogLevel } from '@prisma/client/runtime/library';

import { env } from '@/env.mjs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const levels = {
  debug: ['query', 'error', 'warn', 'info'],
  info: ['error', 'warn', 'info'],
  warn: ['error', 'warn'],
  error: ['error'],
  fatal: ['error'],
} satisfies Record<string, LogLevel[]>;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: levels[env.LOGGER_LEVEL],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
