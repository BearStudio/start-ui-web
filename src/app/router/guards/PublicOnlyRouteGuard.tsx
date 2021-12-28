import { Navigate } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { ErrorBoundary } from '@/errors';

export const PublicOnlyRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  return isAuthenticated ? (
    <Navigate to="/" replace />
  ) : (
    <ErrorBoundary>{children}</ErrorBoundary>
  );
};
