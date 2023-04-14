import { useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/spa/auth/AuthContext';

export const useRedirectUnauthenticated = () => {
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
};
