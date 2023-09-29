import { TRPCClientError } from '@trpc/client';

export function isErrorDatabaseConflict(error: unknown, field: string) {
  return (
    error instanceof TRPCClientError &&
    error.data?.code === 'CONFLICT' &&
    Array.isArray(error.data.prismaError.target) &&
    error.data.prismaError.target.every(
      (t: unknown) => typeof t === 'string'
    ) &&
    error.data.prismaError.target.includes(field)
  );
}
