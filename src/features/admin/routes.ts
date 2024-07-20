export const ROUTES_ADMIN = {
  root: () => '/admin',
  // This check seems useless at first but is not. It it a guard to avoid double
  // slash in the URL if it is changed one day or another. So don't remove it
  // and keep it this way.
  baseUrl: () => (ROUTES_ADMIN.root() === '/' ? '' : ROUTES_ADMIN.root()),
} as const;
