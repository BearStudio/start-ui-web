import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { env } from '@/env.mjs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export class ExtendedTRPCError extends TRPCError {
  public readonly meta: Prisma.PrismaClientKnownRequestError['meta'];

  constructor(opts: {
    message?: TRPCError['message'];
    code?: TRPCError['code'];
    cause?: unknown;
  }) {
    if (
      opts.cause instanceof Prisma.PrismaClientKnownRequestError &&
      opts.cause.code === 'P2002'
    ) {
      super({ code: 'CONFLICT', message: opts.message, cause: opts.cause });
      return;
    }

    super({
      code: opts.code ?? 'INTERNAL_SERVER_ERROR',
      message: opts.message,
      cause: opts.cause,
    });
  }
}

/**
 *
 * @deprecated
 */
export const prismaThrowFormatedTRPCError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new TRPCError({
      code: 'CONFLICT',
      cause: error,
    });
  }
};
