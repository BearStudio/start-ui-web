export const ROUTES_APP = {
  root: () => '/app',
  baseUrl: () => (ROUTES_APP.root() === '/' ? '' : ROUTES_APP.root()),
};
