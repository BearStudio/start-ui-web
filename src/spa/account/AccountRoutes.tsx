import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import { ErrorPage } from '@/components/ErrorPage';
import { PageActivate } from '@/spa/account/PageActivate';
import { PagePassword } from '@/spa/account/PagePassword';
import { PageProfile } from '@/spa/account/PageProfile';
import { PageRegister } from '@/spa/account/PageRegister';
import { PageResetPasswordConfirm } from '@/spa/account/PageResetPasswordConfirm';
import { PageResetPasswordRequest } from '@/spa/account/PageResetPasswordRequest';
import {
  AuthenticatedRouteGuard,
  PublicOnlyRouteGuard,
} from '@/spa/router/guards';

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
