import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import { PageActivate } from '@/app/account/PageActivate';
import { PagePassword } from '@/app/account/PagePassword';
import { PageProfile } from '@/app/account/PageProfile';
import { PageRegister } from '@/app/account/PageRegister';
import { PageResetPasswordConfirm } from '@/app/account/PageResetPasswordConfirm';
import { PageResetPasswordRequest } from '@/app/account/PageResetPasswordRequest';
import {
  AuthenticatedRouteGuard,
  PublicOnlyRouteGuard,
} from '@/app/router/guards';
import { ErrorPage } from '@/components/ErrorPage';

const AccountRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthenticatedRouteGuard>
            <Navigate to="profile" replace />
          </AuthenticatedRouteGuard>
        }
      />

      <Route
        path="register"
        element={
          <PublicOnlyRouteGuard>
            <PageRegister />
          </PublicOnlyRouteGuard>
        }
      />
      <Route
        path="activate"
        element={
          <PublicOnlyRouteGuard>
            <PageActivate />
          </PublicOnlyRouteGuard>
        }
      />
      <Route
        path="reset"
        element={
          <PublicOnlyRouteGuard>
            <PageResetPasswordRequest />
          </PublicOnlyRouteGuard>
        }
      />
      <Route
        path="reset/finish"
        element={
          <PublicOnlyRouteGuard>
            <PageResetPasswordConfirm />
          </PublicOnlyRouteGuard>
        }
      />

      <Route
        path="profile"
        element={
          <AuthenticatedRouteGuard>
            <PageProfile />
          </AuthenticatedRouteGuard>
        }
      />
      <Route
        path="password"
        element={
          <AuthenticatedRouteGuard>
            <PagePassword />
          </AuthenticatedRouteGuard>
        }
      />

      <Route path="*" element={<ErrorPage errorCode={404} />} />
    </Routes>
  );
};

export default AccountRoutes;
