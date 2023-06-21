import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
  notSignedInResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';
import {
  formatUserFromDb,
  prepareUserForDb,
} from '@/app/api/jhipster-mocks/_helpers/user';

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
      return badRequestResponse({ details: bodyParsed.error });
    }

    const updatedUser = formatUserFromDb(
      await db.user.update({
        where: { id: user.id },
        data: prepareUserForDb(bodyParsed.data),
      })
    );

    return NextResponse.json(updatedUser);
  },
});
