export const ROUTES_AUTH = {
  logout: (params: { redirect?: string } = {}) =>
    params.redirect ? `/logout?redirect=${params.redirect}` : '/logout',
  login: () => `/login`,
  loginValidate: (params: { token: string; email: string }) =>
    `${ROUTES_AUTH.login()}/${params.token}?email=${params.email}`,
  register: () => `/register`,
  registerValidate: (params: { token: string; email: string }) =>
    `${ROUTES_AUTH.register()}/${params.token}?email=${params.email}`,
} as const;
