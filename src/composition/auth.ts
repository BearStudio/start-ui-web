export {
  type Auth,
  auth,
  createAuth,
  getDefaultAuth as getAuth,
} from '@/modules/auth/infrastructure/better-auth/auth';
import type { AuthGateway } from '@/modules/auth';
import { getDefaultAuth } from '@/modules/auth/infrastructure/better-auth/auth';
import { createBetterAuthGateway } from '@/modules/auth/infrastructure/better-auth/auth-gateway';

let defaultAuthGateway: AuthGateway | undefined;

export const getAuthGateway = () => {
  defaultAuthGateway ??= createBetterAuthGateway(getDefaultAuth());
  return defaultAuthGateway;
};

/** Test-only. */
export const __resetAuthComposition = () => {
  defaultAuthGateway = undefined;
};
