import React, { useEffect } from 'react';

import {
  useLocation,
  useHistory,
  Route as RouterRoute,
} from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { ErrorBoundary } from '@/errors';

export const Route = (props) => {
  const { isLogged } = useAuthContext();
  const { pathname, search } = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (!isLogged) {
      history.replace(
        `/login?redirect=${encodeURIComponent(pathname + search)}`
      );
    }
  }, [isLogged, history, pathname, search]);

  return !isLogged ? null : (
    <ErrorBoundary>
      <RouterRoute {...props} />
    </ErrorBoundary>
  );
};
