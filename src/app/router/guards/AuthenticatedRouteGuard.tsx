import { useEffect } from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

export const AuthenticatedRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const { pathname, search } = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace(
        `/login?redirect=${encodeURIComponent(pathname + search)}`
      );
    }
  }, [isAuthenticated, history, pathname, search]);

  return !isAuthenticated ? null : children;
};
