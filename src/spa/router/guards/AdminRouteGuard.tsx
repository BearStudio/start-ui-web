import { FC } from 'react';

import { ErrorPage } from '@/components/ErrorPage';
import { useAccount } from '@/spa/account/account.service';
import { useRedirectUnauthenticated } from '@/spa/router/guards/useRedirectUnauthenticated';

import { AuthenticatedRouteGuard } from './AuthenticatedRouteGuard';

const CheckIsAdmin: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { isAdmin, isLoading } = useAccount();

  useRedirectUnauthenticated();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <ErrorPage errorCode={403} />;
  }

  return <>{children}</>;
};

export const AdminRouteGuard: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <AuthenticatedRouteGuard>
      <CheckIsAdmin>{children}</CheckIsAdmin>
    </AuthenticatedRouteGuard>
  );
};
