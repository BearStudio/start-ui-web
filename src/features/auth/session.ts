import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/server/auth';

export const initAuthSsr = createServerFn({ method: 'GET' }).handler(
  async () => {
    const authSession = await auth.api.getSession({
      headers: getRequestHeaders(),
    });

    return {
      authSession,
    };
  }
);

export type AuthSession = Awaited<
  ReturnType<typeof initAuthSsr>
>['authSession'];
