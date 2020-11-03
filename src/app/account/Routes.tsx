import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { ResetPasswordRequestPage } from '@/app/account/ResetPasswordRequestPage';
import { ResetPasswordConfirmPage } from '@/app/account/ResetPasswordConfirmPage';
import { Register } from '@/app/account/Register';
import { RoutePublicOnly } from '../router/RoutePublicOnly';

export const AccountRoutes = () => {
  return (
    <Routes>
      <RoutePublicOnly path="/register" element={<Register />} />
      <RoutePublicOnly path="/reset" element={<ResetPasswordRequestPage />} />
      <RoutePublicOnly
        path="/reset/confirm/:resetKey"
        element={<ResetPasswordConfirmPage />}
      />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
