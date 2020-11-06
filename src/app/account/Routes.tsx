import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route, RoutePublicOnly } from '@/app/router';
import { PageResetPasswordRequest } from '@/app/account/PageResetPasswordRequest';
import { PageResetPasswordConfirm } from '@/app/account/PageResetPasswordConfirm';
import { PageRegister } from '@/app/account/PageRegister';
import { PageActivate } from '@/app/account/PageActivate';
import { PageAccount } from '@/app/account/PageAccount';

export const AccountRoutes = () => {
  return (
    <Routes>
      <RoutePublicOnly path="/register" element={<PageRegister />} />
      <RoutePublicOnly path="/activate" element={<PageActivate />} />
      <RoutePublicOnly path="/reset" element={<PageResetPasswordRequest />} />
      <RoutePublicOnly
        path="/reset/confirm/:resetKey"
        element={<PageResetPasswordConfirm />}
      />

      <Route path="/" element={<PageAccount />} />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
