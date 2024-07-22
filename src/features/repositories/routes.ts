import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';

export const ROUTES_REPOSITORIES = {
  app: {
    root: () => `${ROUTES_APP.baseUrl()}/repositories`,
  },
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/repositories`,
    create: () => `${ROUTES_REPOSITORIES.admin.root()}/create`,
    repository: (params: { id: string }) =>
      `${ROUTES_REPOSITORIES.admin.root()}/${params.id}`,
    update: (params: { id: string }) =>
      `${ROUTES_REPOSITORIES.admin.root()}/${params.id}/update`,
  },
} as const;
