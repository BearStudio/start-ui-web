import { Prisma, PrismaClient } from '@prisma/client';
import { LogLevel } from '@prisma/client/runtime/library';
import { TRPCError } from '@trpc/server';

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

/**
 * We extend the TRPCError so we can implement tRPC code based on what Prisma
 * or other tool throw as an error.
 */
export class ExtendedTRPCError extends TRPCError {
  public readonly meta: Prisma.PrismaClientKnownRequestError['meta'];

  constructor(opts: {
    message?: TRPCError['message'];
    code?: TRPCError['code'];
    cause?: unknown;
  }) {
    // Prisma Conflict Error
    if (
      opts.cause instanceof Prisma.PrismaClientKnownRequestError &&
      opts.cause.code === 'P2002'
    ) {
      super({ code: 'CONFLICT', message: opts.message, cause: opts.cause });
      return;
    }

    // Unknown Error
    super({
      code: opts.code ?? 'INTERNAL_SERVER_ERROR',
      message: opts.message,
      cause: opts.cause,
    });
  }
}
