import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';
import { formatUserFromDb } from '@/app/api/jhipster-mocks/_helpers/user';

export const POST = apiMethod({
  public: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({
        key: z.string(),
        newPassword: z.string(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse({ details: bodyParsed.error });
    }

    // Clear all expired tokens
    await db.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    const verificationToken = await db.verificationToken.findUnique({
      where: { token: bodyParsed.data.key },
    });

    if (!verificationToken) {
      return badRequestResponse();
    }

    const passwordHash = await bcrypt.hash(bodyParsed.data.newPassword, 12);

    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: verificationToken.userId },
        data: { password: passwordHash },
      }),
      db.verificationToken.delete({ where: { token: bodyParsed.data.key } }),
    ]);

    const user = formatUserFromDb(updatedUser);

    if (!user) {
      return badRequestResponse({ title: 'Invalid token' });
    }

    return NextResponse.json(user);
  },
});
