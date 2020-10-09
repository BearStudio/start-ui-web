import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route } from '@/app/router';
import { useAuthContext } from '@/app/auth/AuthContext';

export const RouteAuth = (props) => {
  const { isLogged } = useAuthContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) navigate(`/login?redirect=${pathname}`);
  }, [isLogged, navigate, pathname]);

  return <Route {...props} />;
};
