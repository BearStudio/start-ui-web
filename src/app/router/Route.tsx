import React, { useEffect } from 'react';
import {
  useLocation,
  useNavigate,
  Route as RouterRoute,
} from 'react-router-dom';
import { useAuthContext } from '@/app/auth/AuthContext';
import { ErrorBoundary } from '@/errors';

export const Route = (props) => {
  const { isLogged } = useAuthContext();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) {
      navigate(`/login?redirect=${encodeURIComponent(pathname + search)}`);
    }
  }, [isLogged, navigate, pathname, search]);

  return !isLogged ? null : (
    <ErrorBoundary>
      <RouterRoute {...props} />
    </ErrorBoundary>
  );
};
