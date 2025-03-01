import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';

export const ROUTES_ACCOUNT = {
  app: {
    root: () => `${ROUTES_APP.baseUrl()}/account` as const,
  },
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/account` as const,
    profile: () => `${ROUTES_ACCOUNT.admin.root()}/profile` as const,
    email: () => `${ROUTES_ACCOUNT.admin.root()}/email` as const,
  },
} as const;
