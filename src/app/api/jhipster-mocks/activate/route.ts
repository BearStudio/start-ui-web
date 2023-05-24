import { NextResponse } from 'next/server';
import { z } from 'zod';

import { activateAccount } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/helpers';

export const GET = apiMethod({
  public: true,
  handler: async ({ params }) => {
    const safeParams = z.object({ key: z.string() }).safeParse(params);

    if (!safeParams.success) {
      return badRequestResponse();
    }

    const user = await activateAccount({
      token: safeParams.data.key,
    });

    if (!user) {
      return badRequestResponse();
    }

    return new NextResponse('ok', { status: 200 });
  },
});
