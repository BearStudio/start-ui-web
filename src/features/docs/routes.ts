import { ROUTES_ADMIN } from '@/features/admin/routes';

export const ROUTES_DOCS = {
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/docs`,
    api: () => `${ROUTES_DOCS.admin.root()}/api`,
  },
} as const;
