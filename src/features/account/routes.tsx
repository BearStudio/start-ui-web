import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';

export const ROUTES_ACCOUNT = {
  app: {
    root: () => `${ROUTES_APP.root()}/account`,
  },
  admin: {
    root: () => `${ROUTES_ADMIN.root()}/account`,
    profile: () => `${ROUTES_ACCOUNT.admin.root()}/profile`,
    email: () => `${ROUTES_ACCOUNT.admin.root()}/email`,
  },
};
