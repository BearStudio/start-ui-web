import { NextResponse } from 'next/server';
import { z } from 'zod';

import { updateAccount } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
  notSignedInResponse,
} from '@/app/api/jhipster-mocks/helpers';

export const GET = apiMethod({
  handler: async ({ user }) => {
    return NextResponse.json(user);
  },
});

export const POST = apiMethod({
  handler: async ({ req, user }) => {
    if (!user?.id) {
      return notSignedInResponse();
    }
    const bodyParsed = z
      .object({
        email: z.string().email(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        langKey: z.string(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse();
    }

    const updatedUser = await updateAccount(user.id, bodyParsed.data);
    return NextResponse.json(updatedUser);
  },
});
