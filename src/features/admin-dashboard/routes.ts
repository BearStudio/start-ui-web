import { ROUTES_ADMIN } from '@/features/admin/routes';

export const ROUTES_ADMIN_DASHBOARD = {
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/dashboard`,
  },
} as const;
