import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route } from '@/app/router';
import { useAuthContext } from '@/app/auth/AuthContext';

export const RouteAuth = (props) => {
  const { isLogged } = useAuthContext();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) {
      navigate(`/login?redirect=${encodeURIComponent(pathname + search)}`);
    }
  }, [isLogged, navigate, pathname, search]);

  return !isLogged ? null : <Route {...props} />;
};
