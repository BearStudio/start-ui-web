import { NextResponse } from 'next/server';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';

export const GET = apiMethod({
  public: true,
  handler: async ({ searchParams }) => {
    const token = searchParams.get('key');

    if (!token) {
      return badRequestResponse();
    }

    // Clear all expired tokens
    await db.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return undefined;
    }

    const [user] = await db.$transaction([
      db.user.update({
        where: { id: verificationToken.userId },
        data: { activated: true },
      }),
      db.verificationToken.delete({ where: { token } }),
    ]);

    if (!user) {
      return badRequestResponse();
    }

    return new NextResponse('ok', { status: 200 });
  },
});
