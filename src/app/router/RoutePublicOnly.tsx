import React, { useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

import { RoutePublic } from './RoutePublic';

export const RoutePublicOnly = (props) => {
  const { isLogged } = useAuthContext();
  const history = useHistory();

  useEffect(() => {
    if (isLogged) {
      history.replace(`/`);
    }
  }, [isLogged, history]);

  return isLogged ? null : <RoutePublic {...props} />;
};
