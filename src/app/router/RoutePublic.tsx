import { ErrorBoundary } from '@/errors';
import React from 'react';
import { Route } from 'react-router-dom';

export const RoutePublic = (props) => {
  return (
    <ErrorBoundary>
      <Route {...props} />
    </ErrorBoundary>
  );
};
