import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Route } from '@/app/router';
import { useAuthContext } from '@/app/auth/AuthContext';

export const RouteAuth = (props) => {
  const { isLogged } = useAuthContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isLogged) navigate(`/login?redirect=${pathname}`);
  }, [isLogged, navigate, pathname]);

  if (!isLogged) {
    return null;
  }

  return <Route {...props} />;
};
