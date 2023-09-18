import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export const prismaThrowFormatedTRPCError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new TRPCError({
      code: 'CONFLICT',
    });
  }
};
