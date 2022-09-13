import { FC, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const AuthenticatedRouteGuard: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthContext();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(pathname + search)}`, {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, pathname, search]);

  return !isAuthenticated ? null : <ErrorBoundary>{children}</ErrorBoundary>;
};
