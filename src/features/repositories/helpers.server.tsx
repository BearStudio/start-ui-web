import { Prisma } from '@prisma/client';

import { errorResponseUnknown } from '@/api/helpers';

export const repositoryErrorResponse = (e: unknown) => {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === 'P2002' &&
    Array.isArray(e.meta?.target) &&
    e.meta?.target?.includes('login')
  ) {
    return {
      status: 400,
      body: {
        title: 'Repository name already used',
        errorKey: 'repositoryexists',
      },
    } as const;
  }

  return errorResponseUnknown;
};
