import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';

export const ROUTES_REPOSITORIES = {
  app: {
    root: () => `${ROUTES_APP.baseUrl()}/repositories` as const,
  },
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/repositories` as const,
    create: () => `${ROUTES_REPOSITORIES.admin.root()}/create` as const,
    repository: () => `${ROUTES_REPOSITORIES.admin.root()}/:id` as const,
    update: () => `${ROUTES_REPOSITORIES.admin.root()}/:id/update` as const,
  },
} as const;
