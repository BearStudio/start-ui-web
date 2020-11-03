import React, { useEffect } from 'react';
import { useNavigate, Route} from 'react-router-dom';
import { useAuthContext } from '@/app/auth/AuthContext';

export const RoutePublicOnly = (props) => {
  const { isLogged } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogged) {
      navigate(`/`);
    }
  }, [isLogged, navigate]);

  return isLogged ? null : <Route {...props} />;
};
