import { FC } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useAccount } from '@/spa/account/account.service';
import { useRedirectUnauthenticated } from '@/spa/router/guards/useRedirectUnauthenticated';

export const AdminRouteGuard: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { isAdmin, isLoading } = useAccount();

  useRedirectUnauthenticated();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <ErrorPage errorCode={403} />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
