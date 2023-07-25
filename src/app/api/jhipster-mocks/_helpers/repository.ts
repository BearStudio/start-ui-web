import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import { unknownErrorResponse } from './api';

export const repositoryErrorResponse = (e: unknown) => {
  // We want to keep it readable, so we disable the next line.
  // eslint-disable-next-line sonarjs/no-collapsible-if
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === 'P2002' &&
    Array.isArray(e.meta?.target)
  ) {
    if (e.meta?.target?.includes('name')) {
      return NextResponse.json(
        { title: 'Name already used', errorKey: 'name_already_used' },
        { status: 400 }
      );
    }
  }
  return unknownErrorResponse();
};
