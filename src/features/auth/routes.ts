import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';

export const ROUTES_AUTH = {
  logout: (params: { redirect?: string } = {}) =>
    params.redirect ? `/logout?redirect=${params.redirect}` : '/logout',
  app: {
    login: () => `${ROUTES_APP.baseUrl()}/login`,
    loginValidate: (params: { token: string; email: string }) =>
      `${ROUTES_AUTH.app.login()}/${params.token}?email=${params.email}`,
    register: () => `${ROUTES_APP.baseUrl()}/register`,
    registerValidate: (params: { token: string; email: string }) =>
      `${ROUTES_AUTH.app.register()}/${params.token}?email=${params.email}`,
  },
  admin: {
    login: () => `${ROUTES_ADMIN.baseUrl()}/login`,
    loginValidate: (params: { token: string; email: string }) =>
      `${ROUTES_AUTH.admin.login()}/${params.token}?email=${params.email}`,
  },
} as const;
