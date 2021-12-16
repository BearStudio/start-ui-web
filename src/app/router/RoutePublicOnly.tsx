import React, { useEffect } from 'react';

import { Route, useHistory } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

export const RoutePublicOnly = (props) => {
  const { isAuthenticated } = useAuthContext();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.replace(`/`);
    }
  }, [isAuthenticated, history]);

  return isAuthenticated ? null : <Route {...props} />;
};
