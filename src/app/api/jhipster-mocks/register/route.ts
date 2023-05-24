import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAccount } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
  unknownErrorResponse,
} from '@/app/api/jhipster-mocks/helpers';

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
      return badRequestResponse();
    }

    const user = await createAccount(bodyParsed.data);

    if (!user) {
      return unknownErrorResponse();
    }

    return NextResponse.json(user);
  },
});
