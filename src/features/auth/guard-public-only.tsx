import { Activity, ReactNode } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { useSession } from '@/features/auth/use-session';
import { useRedirectAfterLogin } from '@/features/auth/utils';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = useSession();
  useRedirectAfterLogin();

  if (session.error && session.error.status > 0) {
    return <PageError type="unknown-auth-error" />;
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
