import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route } from '@/app/router';
import { useAuthContext } from '@/app/auth/AuthContext';

export const RouteAuth = (props) => {
  const { isLogged } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) navigate('/login');
  }, [isLogged, navigate]);

  if (!isLogged) {
    return null;
  }

  return <Route {...props} />;
};
