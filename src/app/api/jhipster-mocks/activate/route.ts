import { NextResponse } from 'next/server';

import { activateAccount } from '@/app/api/jhipster-mocks/account/service';
import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/helpers';

export const GET = apiMethod({
  public: true,
  handler: async ({ searchParams }) => {
    const token = searchParams.get('key');

    if (!token) {
      return badRequestResponse();
    }

    const user = await activateAccount({ token });

    if (!user) {
      return badRequestResponse();
    }

    return new NextResponse('ok', { status: 200 });
  },
});
