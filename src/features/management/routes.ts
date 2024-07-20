import { ROUTES_ADMIN } from '@/features/admin/routes';

export const ROUTES_MANAGEMENT = {
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/management`,
  },
} as const;
