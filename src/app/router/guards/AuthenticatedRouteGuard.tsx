import { useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

export const AuthenticatedRouteGuard = ({ children }) => {
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

  return !isAuthenticated ? null : children;
};
