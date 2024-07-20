export const ROUTES_ADMIN = {
  root: () => '/admin',
  baseUrl: () => (ROUTES_ADMIN.root() === '/' ? '' : ROUTES_ADMIN.root()),
} as const;
