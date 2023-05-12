import { Navigate, Outlet, RouteObject } from 'react-router-dom';

import { ErrorPage } from '@/components/ErrorPage';
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
import PageUserCreate from '@/features/users/PageUserCreate';
import PageUserUpdate from '@/features/users/PageUserUpdate';
import PageUsers from '@/features/users/PageUsers';
import { Layout } from '@/layout/Layout';

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
            path: 'logout',
            element: <PageLogout />,
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
