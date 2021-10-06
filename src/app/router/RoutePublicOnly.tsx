import React, { useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

import { RoutePublic } from './RoutePublic';

export const RoutePublicOnly = (props) => {
  const { isAuthenticated } = useAuthContext();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.replace(`/`);
    }
  }, [isAuthenticated, history]);

  return isAuthenticated ? null : <RoutePublic {...props} />;
};
