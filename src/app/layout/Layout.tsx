import React from 'react';
import { useAuthContext } from '@/app/auth/AuthContext';
import { Navbar } from '@/app/layout/Navbar';

export const Layout = ({ children }) => {
  const { isLogged } = useAuthContext();

  return (
    <>
      {isLogged && <Navbar />}
      {children}
    </>
  );
};
