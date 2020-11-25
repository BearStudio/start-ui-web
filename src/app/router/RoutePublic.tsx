import React from 'react';

import { Route } from 'react-router-dom';

import { ErrorBoundary } from '@/errors';

export const RoutePublic = (props) => {
  return (
    <ErrorBoundary>
      <Route {...props} />
    </ErrorBoundary>
  );
};
