import { FC } from 'react';

import { Navigate } from 'react-router-dom';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthContext } from '@/spa/auth/AuthContext';

export const PublicOnlyRouteGuard: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthContext();

  return isAuthenticated ? (
    <Navigate to="/" replace />
  ) : (
    <ErrorBoundary>{children}</ErrorBoundary>
  );
};
