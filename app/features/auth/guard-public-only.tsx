import { ReactNode } from 'react';

import { authClient } from '@/lib/auth/client';

import { useRedirectAfterLogin } from '@/features/auth/utils';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession();
  useRedirectAfterLogin();

  if (session.isPending) {
    return <>{children}</>;
  }

  if (session.error && session.error.status > 0) {
    return (
      <div>
        <p>Something wrong happened (public guard)</p>
        <p>{session.error.message}</p>
        <pre>{JSON.stringify(session.error, null, 2)}</pre>
      </div>
    ); // TODO
  }

  if (session.data?.user) {
    return null;
  }

  return <>{children}</>;
};
