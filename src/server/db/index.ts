import { envServer } from '@/env/server';
import { timingStore } from '@/server/timing-store';

import { PrismaClient } from './generated/client';

const levels = {
  trace: ['query', 'error', 'warn', 'info'],
  debug: ['error', 'warn', 'info'],
  info: ['error', 'warn', 'info'],
  warn: ['error', 'warn'],
  error: ['error'],
  fatal: ['error'],
} satisfies Record<string, ('query' | 'error' | 'warn' | 'info')[]>;

function createPrisma() {
  return new PrismaClient({
    log: levels[envServer.LOGGER_LEVEL],
  }).$extends({
    name: 'server-timing',
    query: {
      $allModels: {
        async $allOperations({ query, args, model, operation }) {
          const start = performance.now();

          const result = await query(args);

          const duration = performance.now() - start;

          const store = timingStore.getStore();
          if (store) {
            store.prisma.push({
              model,
              operation,
              duration,
            });
          }

          return result;
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
  serverTiming?: Array<{ key: string; duration: string }>;
};

export const db = globalForPrisma.prisma ?? createPrisma();

if (import.meta.env.DEV) globalForPrisma.prisma = db;
