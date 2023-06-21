import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
  notSignedInResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';
import { formatUserFromDb } from '@/app/api/jhipster-mocks/_helpers/user';

export const POST = apiMethod({
  handler: async ({ req, user }) => {
    if (!user?.id) {
      return notSignedInResponse();
    }

    const bodyParsed = z
      .object({
        currentPassword: z.string(),
        newPassword: z.string(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse({ details: bodyParsed.error });
    }

    const currentUser = await db.user.findUnique({ where: { id: user.id } });

    if (!currentUser?.password) {
      return badRequestResponse();
    }

    const isPasswordValid = await bcrypt.compare(
      bodyParsed.data.currentPassword,
      currentUser.password
    );

    if (!isPasswordValid) {
      return badRequestResponse();
    }

    const passwordHash = await bcrypt.hash(bodyParsed.data.newPassword, 12);

    const updatedUser = formatUserFromDb(
      await db.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
        },
      })
    );

    if (!updatedUser) {
      return badRequestResponse();
    }

    return NextResponse.json(updatedUser);
  },
});
