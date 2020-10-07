import React from 'react';
import { Route as RouterRoute } from 'react-router-dom';
import { ErrorBoundary } from '@/errors';

export const Route = (props) => {
  return (
    <ErrorBoundary>
      <RouterRoute {...props} />
    </ErrorBoundary>
  );
};
