import { NextResponse } from 'next/server';
import { z } from 'zod';

import { updatePassword } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
  notSignedInResponse,
} from '@/app/api/jhipster-mocks/helpers';

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
      return badRequestResponse();
    }

    const updatedUser = await updatePassword(user.id, bodyParsed.data);

    if (!updatedUser) {
      return badRequestResponse();
    }

    return NextResponse.json(updatedUser);
  },
});
