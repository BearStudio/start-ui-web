import React, { useEffect } from 'react';

import {
  Route as RouterRoute,
  useHistory,
  useLocation,
} from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { ErrorBoundary } from '@/errors';

export const Route = (props) => {
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

  return !isAuthenticated ? null : (
    <ErrorBoundary>
      <RouterRoute {...props} />
    </ErrorBoundary>
  );
};
