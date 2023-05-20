import React from 'react';

import { Navigate, Outlet, RouteObject } from 'react-router-dom';

import { ErrorPage } from '@/components/ErrorPage';
import PageActivate from '@/features/account/PageActivate';
import PagePassword from '@/features/account/PagePassword';
import PageProfile from '@/features/account/PageProfile';
import PageRegister from '@/features/account/PageRegister';
import PageResetPasswordConfirm from '@/features/account/PageResetPasswordConfirm';
import PageResetPasswordRequest from '@/features/account/PageResetPasswordRequest';
import PageApiDocumentation from '@/features/api-documentation/PageApiDocumentation';
import { GuardAdmin } from '@/features/auth/GuardAdmin';
import { GuardAuthenticated } from '@/features/auth/GuardAuthenticated';
import { GuardPublicOnly } from '@/features/auth/GuardPublicOnly';
import { LoginModalInterceptor } from '@/features/auth/LoginModalInterceptor';
import PageLogin from '@/features/auth/PageLogin';
import PageLogout from '@/features/auth/PageLogout';
import PageDashboard from '@/features/dashboard/PageDashboard';
import PageUsers from '@/features/users/PageUsers';
import { Layout } from '@/layout/Layout';

const PageUserCreate = React.lazy(
  () => import('@/features/users/PageUserCreate')
);

const PageUserUpdate = React.lazy(
  () => import('@/features/users/PageUserUpdate')
);

export const routes = [
  {
    path: '/',
    errorElement: <ErrorPage />,
    element: (
      <>
        <Outlet />
        <LoginModalInterceptor />
      </>
    ),
    children: [
      {
        path: 'logout',
        element: <PageLogout />,
      },

      /**
       * Public Routes
       */
      {
        path: 'login',

        element: (
          <GuardPublicOnly>
            <PageLogin />
          </GuardPublicOnly>
        ),
      },
      {
        path: 'account',
        element: (
          <GuardPublicOnly>
            <Outlet />
          </GuardPublicOnly>
        ),
        children: [
          {
            path: 'activate',
            element: <PageActivate />,
          },
          {
            path: 'register',
            element: <PageRegister />,
          },
          {
            path: 'reset',
            element: <PageResetPasswordRequest />,
          },
          {
            path: 'finish',
            element: <PageResetPasswordConfirm />,
          },
        ],
      },

      /**
       * Authenticated Routes
       */
      {
        path: '',
        element: (
          <GuardAuthenticated>
            <Layout>
              <Outlet />
            </Layout>
          </GuardAuthenticated>
        ),
        children: [
          {
            path: '',
            element: <PageDashboard />,
          },
          {
            path: 'account',
            children: [
              {
                path: '',
                element: <Navigate to="profile" replace />,
              },
              {
                path: 'profile',
                element: <PageProfile />,
              },
              {
                path: 'password',
                element: <PagePassword />,
              },
            ],
          },
          /**
           * Admin Routes
           */
          {
            path: 'admin',
            element: (
              <GuardAdmin>
                <Outlet />
              </GuardAdmin>
            ),
            children: [
              {
                path: '',
                element: <Navigate to="users" replace />,
              },
              {
                path: 'users',
                children: [
                  { path: '', element: <PageUsers /> },
                  { path: 'create', element: <PageUserCreate /> },
                  { path: ':login', element: <PageUserUpdate /> },
                ],
              },
              {
                path: 'api',
                children: [{ path: '', element: <PageApiDocumentation /> }],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <ErrorPage errorCode={404} /> },
] satisfies RouteObject[];
