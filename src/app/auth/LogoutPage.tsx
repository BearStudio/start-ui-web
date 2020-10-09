import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/auth/AuthContext';

export const LogoutPage = () => {
  const { updateToken } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    updateToken(null);
    navigate('/login');
  }, [updateToken, navigate]);

  return <div>Logout</div>;
};
