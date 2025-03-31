import { ReactNode } from 'react';

import { authClient } from '@/lib/auth/client';

import { PageError } from '@/components/page-error';

import { useRedirectAfterLogin } from '@/features/auth/utils';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession();
  useRedirectAfterLogin();

  if (session.isPending) {
    return <>{children}</>;
  }

  if (session.error && session.error.status > 0) {
    return <PageError />;
  }

  if (session.data?.user) {
    return null;
  }

  return <>{children}</>;
};
