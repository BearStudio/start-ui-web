import React from 'react';
import { Error403 } from '@/errors';
import { useAccount } from '@/app/account/service';
import { Route } from './Route';

export const RouteAdmin = (props) => {
  const { isAdmin, isLoading } = useAccount();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Error403 />;
  }

  return <Route {...props} />;
};
