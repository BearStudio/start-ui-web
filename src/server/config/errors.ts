import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';

/**
 * We extend the TRPCError so we can implement tRPC code based on what Prisma
 * or other tool throw as an error.
 */
export class ExtendedTRPCError extends TRPCError {
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
