import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
  notSignedInResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';
import { formatUserFromDb } from '@/app/api/jhipster-mocks/_helpers/user';

export const GET = apiMethod({
  admin: true,
  handler: async ({ params }) => {
    const safeParams = z.object({ login: z.string() }).safeParse(params);
    if (!safeParams.success) {
      return badRequestResponse({ details: safeParams.error });
    }

    const user = formatUserFromDb(
      await db.user.findUnique({ where: { login: safeParams.data.login } })
    );

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
      return badRequestResponse({ details: safeParams.error });
    }

    await db.user.delete({
      where: { login: safeParams.data.login, NOT: { id: user.id } },
    });

    return new NextResponse('ok', { status: 200 });
  },
});
