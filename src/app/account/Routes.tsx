import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { ResetPasswordRequestPage } from '@/app/account/ResetPasswordRequestPage';
import { ResetPasswordConfirmPage } from '@/app/account/ResetPasswordConfirmPage';

export const AccountRoutes = () => {
  return (
    <Routes>
      <Route exact path="/reset" component={ResetPasswordRequestPage} />
      <Route
        exact
        path="/reset/confirm/:resetKey"
        component={ResetPasswordConfirmPage}
      />

      <Route component={Error404} />
    </Routes>
  );
};
