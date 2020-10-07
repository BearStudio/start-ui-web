import React from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { Route } from '@/app/router';
import { useAuthContext } from '@/app/auth/AuthContext';

export const RouteAuth = (props) => {
  const { isLogged } = useAuthContext();
  const location = useLocation();

  if (!isLogged) {
    return <Redirect
      to={{
        pathname: '/login',
        state: { referrer: location }
      }}
    />
  }

  return <Route {...props} />;
};
