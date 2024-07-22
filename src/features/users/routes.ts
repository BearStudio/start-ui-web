import { ROUTES_MANAGEMENT } from '@/features/management/routes';

export const ROUTES_USERS = {
  admin: {
    root: () => `${ROUTES_MANAGEMENT.admin.root()}/users`,
    create: () => `${ROUTES_USERS.admin.root()}/create`,
    user: (params: { id: string }) =>
      `${ROUTES_USERS.admin.root()}/${params.id}`,
  },
} as const;
