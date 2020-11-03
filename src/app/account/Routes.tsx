import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { ResetPasswordRequestPage } from '@/app/account/ResetPasswordRequestPage';
import { ResetPasswordConfirmPage } from '@/app/account/ResetPasswordConfirmPage';
import { RegisterPage } from '@/app/account/RegisterPage';
import { ActivatePage } from '@/app/account/ActivatePage';
import { RoutePublicOnly } from '../router/RoutePublicOnly';

export const AccountRoutes = () => {
  return (
    <Routes>
      <RoutePublicOnly path="/register" element={<RegisterPage />} />
      <RoutePublicOnly path="/activate" element={<ActivatePage />} />
      <RoutePublicOnly path="/reset" element={<ResetPasswordRequestPage />} />
      <RoutePublicOnly
        path="/reset/confirm/:resetKey"
        element={<ResetPasswordConfirmPage />}
      />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
