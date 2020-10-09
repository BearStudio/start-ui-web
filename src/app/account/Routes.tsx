import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { ResetPasswordRequestPage } from '@/app/account/ResetPasswordRequestPage';
import { ResetPasswordConfirmPage } from '@/app/account/ResetPasswordConfirmPage';

export const AccountRoutes = () => {
  return (
    <Routes>
      <Route path="/reset" element={<ResetPasswordRequestPage />} />
      <Route
        path="/reset/confirm/:resetKey"
        element={<ResetPasswordConfirmPage />}
      />

      <Route element={<Error404 />} />
    </Routes>
  );
};
