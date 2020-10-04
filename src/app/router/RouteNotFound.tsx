import React from 'react';
import { Route } from '@/app/router';
import { Error404 } from '@/errors/Error404';

export const RouteNotFound = (props) => {
  return <Route element={<Error404 />} {...props} />;
};
