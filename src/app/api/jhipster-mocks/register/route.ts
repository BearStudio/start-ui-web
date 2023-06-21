import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';
import {
  prepareUserForDb,
  userErrorResponse,
} from '@/app/api/jhipster-mocks/_helpers/user';

export const POST = apiMethod({
  public: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({
        email: z.string().email(),
        login: z.string().min(2),
        password: z.string().min(4),
        langKey: z.string(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse({ details: bodyParsed.error });
    }

    const passwordHash = await bcrypt.hash(bodyParsed.data.password, 12);

    let user;
    try {
      user = await db.user.create({
        data: prepareUserForDb({
          email: bodyParsed.data.email.toLowerCase().trim(),
          login: bodyParsed.data.login.toLowerCase().trim(),
          password: passwordHash,
          langKey: bodyParsed.data.langKey,
        }),
      });
    } catch (e) {
      return userErrorResponse(e);
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
✉️ Activation link: ${process.env.NEXT_PUBLIC_BASE_URL}/app/account/activate?key=${token}
👆👆👆👆👆👆👆👆👆👆`);

    return NextResponse.json(user);
  },
});
