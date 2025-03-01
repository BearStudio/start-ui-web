import { ROUTES_MANAGEMENT } from '@/features/management/routes';

export const ROUTES_USERS = {
  admin: {
    root: () => `${ROUTES_MANAGEMENT.admin.root()}/users` as const,
    create: () => `${ROUTES_USERS.admin.root()}/create` as const,
    user: () => `${ROUTES_USERS.admin.root()}/:id` as const,
  },
} as const;
