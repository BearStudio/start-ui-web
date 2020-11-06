import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/auth/AuthContext';
import { RoutePublic } from './RoutePublic';

export const RoutePublicOnly = (props) => {
  const { isLogged } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogged) {
      navigate(`/`);
    }
  }, [isLogged, navigate]);

  return isLogged ? null : <RoutePublic {...props} />;
};
