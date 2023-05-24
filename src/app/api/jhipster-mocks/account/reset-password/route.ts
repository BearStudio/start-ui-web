import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resetPasswordInit } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/helpers';

export const POST = apiMethod({
  public: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .string()
      .email()
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse();
    }

    await resetPasswordInit(bodyParsed.data);
    return new NextResponse('ok', { status: 200 });
  },
});
