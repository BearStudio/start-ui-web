import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getUserByLogin,
  removeUserByLogin,
} from '@/app/api/jhipster-mocks/admin/users/service';
import {
  apiMethod,
  badRequestResponse,
  notSignedInResponse,
} from '@/app/api/jhipster-mocks/helpers';

export const GET = apiMethod({
  admin: true,
  handler: async ({ params }) => {
    const safeParams = z.object({ login: z.string() }).safeParse(params);
    if (!safeParams.success) {
      return badRequestResponse();
    }
    const user = await getUserByLogin(safeParams.data.login);
    return NextResponse.json(user);
  },
});
export const DELETE = apiMethod({
  admin: true,
  handler: async ({ params, user }) => {
    if (!user?.id) {
      return notSignedInResponse();
    }
    const safeParams = z.object({ login: z.string() }).safeParse(params);
    if (!safeParams.success) {
      return badRequestResponse();
    }

    await removeUserByLogin(safeParams.data.login, user.id);
    return new NextResponse('ok', { status: 200 });
  },
});
