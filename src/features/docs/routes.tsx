import { ROUTES_ADMIN } from '@/features/admin/routes';

export const ROUTES_DOCS = {
  admin: {
    root: () => `${ROUTES_ADMIN.root()}/docs`,
    api: () => `${ROUTES_DOCS.admin.root()}/api`,
  },
};
