import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';

export const POST = apiMethod({
  public: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .string()
      .email()
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse({ details: bodyParsed.error });
    }

    const user = await db.user.findUnique({
      where: { email: bodyParsed.data },
      select: { id: true },
    });

    if (!user) {
      return badRequestResponse();
    }

    const token = randomUUID();

    await db.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: dayjs().add(1, 'hour').toDate(),
      },
    });

    // REPLACE ME WITH EMAIL SERVICE
    console.log(`👇👇👇👇👇👇👇👇👇👇
  ✉️ Reset password link: ${process.env.NEXT_PUBLIC_BASE_URL}/app/account/reset/finish?key=${token}
  👆👆👆👆👆👆👆👆👆👆`);

    return new NextResponse('ok', { status: 200 });
  },
});
