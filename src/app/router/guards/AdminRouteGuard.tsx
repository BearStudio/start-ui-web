import { FC } from 'react';

import { useAccount } from '@/app/account/account.service';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';

export const AdminRouteGuard: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { isAdmin, isLoading } = useAccount();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <ErrorPage errorCode={403} />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
