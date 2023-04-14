import { FC } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthContext } from '@/spa/auth/AuthContext';
import { useRedirectUnauthenticated } from '@/spa/router/guards/useRedirectUnauthenticated';

export const AuthenticatedRouteGuard: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthContext();

  useRedirectUnauthenticated();

  return !isAuthenticated ? null : <ErrorBoundary>{children}</ErrorBoundary>;
};
