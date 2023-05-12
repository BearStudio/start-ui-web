import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resetPasswordFinish } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/helpers';

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
      return badRequestResponse();
    }

    const user = await resetPasswordFinish({
      token: bodyParsed.data.key,
      newPassword: bodyParsed.data.newPassword,
    });

    if (!user) {
      return badRequestResponse({ title: 'Invalid token' });
    }

    return NextResponse.json(user);
  },
});
