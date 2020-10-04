import React from 'react';
import { Routes } from 'react-router-dom';
import { Route, RouteNotFound } from '@/app/router';
import { ResetPasswordRequestPage } from '@/app/account/ResetPasswordRequestPage';
import { ResetPasswordConfirmPage } from '@/app/account/ResetPasswordConfirmPage';

export const AccountRoutes = () => {
  return (
    <Routes>
      <RouteNotFound path="*" />
      <Route path="reset" element={<ResetPasswordRequestPage />} />
      <Route
        path="reset/confirm/:resetKey"
        element={<ResetPasswordConfirmPage />}
      />
    </Routes>
  );
};
