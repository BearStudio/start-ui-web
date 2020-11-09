import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthContext } from '@/app/auth/AuthContext';

export const PageLogout = () => {
  const { updateToken } = useAuthContext();
  const history = useHistory();

  useEffect(() => {
    updateToken(null);
    history.push('/login');
  }, [updateToken, history]);

  return <div>Logout</div>;
};
