import { Activity, ReactNode } from 'react';

import { PageError } from '@/components/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { useRedirectAfterLogin } from '@/features/auth/utils';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession();
  useRedirectAfterLogin();

  if (session.error && session.error.status > 0) {
    return <PageError />;
  }

  return (
    <>
      {session.isPending && <Spinner full />}
      <Activity mode={session.isPending ? 'hidden' : 'visible'}>
        {children}
      </Activity>
    </>
  );
};
