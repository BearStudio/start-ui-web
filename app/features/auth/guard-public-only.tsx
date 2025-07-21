import { ReactNode } from 'react';

import { PageError } from '@/components/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { useRedirectAfterLogin } from '@/features/auth/utils';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession();
  useRedirectAfterLogin();

  if (session.isPending) {
    return <Spinner full />;
  }

  if (session.error && session.error.status > 0) {
    return <PageError />;
  }

  if (session.data?.user) {
    return null;
  }

  return <>{children}</>;
};
