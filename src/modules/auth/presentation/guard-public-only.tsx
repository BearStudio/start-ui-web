import { Activity, ReactNode } from 'react';

import { PageError } from '@/platform/components/errors/page-error';
import { Spinner } from '@/platform/components/ui/spinner';

import { useAuthSession } from '@/modules/auth/client';
import { useRedirectAfterLogin } from '@/modules/auth/presentation/utils';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = useAuthSession();
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
