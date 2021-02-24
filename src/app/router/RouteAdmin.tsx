import React from 'react';

import { useAccount } from '@/app/account/account.service';
import { Error403 } from '@/errors';

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
