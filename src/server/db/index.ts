import { Result, TaggedError } from 'better-result';

import { envServer } from '@/env/server';
import { timingStore } from '@/server/timing-store';

import { Prisma, PrismaClient } from './generated/client';

export class PrismaUniqueConstraintError extends TaggedError(
  'PrismaUniqueConstraintError'
)<{
  message: string;
  target: unknown;
}>() {}

export class PrismaNotFoundError extends TaggedError('PrismaNotFoundError')<{
  message: string;
}>() {}

export class PrismaForeignKeyError extends TaggedError(
  'PrismaForeignKeyError'
)<{
  message: string;
}>() {}

export class PrismaValidationError extends TaggedError(
  'PrismaValidationError'
)<{
  message: string;
}>() {}

export class PrismaUnknownError extends TaggedError('PrismaUnknownError')<{
  message: string;
  cause: unknown;
}>() {}

export type PrismaError =
  | PrismaUniqueConstraintError
  | PrismaNotFoundError
  | PrismaForeignKeyError
  | PrismaValidationError
  | PrismaUnknownError;

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

export const tryQuery = <T>(promise: Promise<T>) =>
  Result.tryPromise({
    try: () => promise,
    catch: (e): PrismaError => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002':
            return new PrismaUniqueConstraintError({
              message: 'Unique constraint violation',
              target: e.meta?.target,
            });
          case 'P2025':
            return new PrismaNotFoundError({
              message: 'Record not found',
            });
          case 'P2003':
            return new PrismaForeignKeyError({
              message: 'Foreign key constraint violation',
            });
          default:
            return new PrismaUnknownError({
              message: `Database error: ${e.code}`,
              cause: e,
            });
        }
      }
      if (e instanceof Prisma.PrismaClientValidationError) {
        return new PrismaValidationError({
          message: 'Database validation error',
        });
      }
      return new PrismaUnknownError({
        message: e instanceof Error ? e.message : 'Unknown database error',
        cause: e,
      });
    },
  });
