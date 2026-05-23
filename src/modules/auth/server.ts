import type { Auth } from '@/composition/auth';
import { auth, getAuthGateway } from '@/composition/auth';

import { createServerContextTools } from './transport/tanstack/server-context';

export type {
  AuthenticatedSession,
  AuthenticatedUser,
} from './application/ports/auth-gateway';
export {
  createServerContextTools,
  type ProcedureLogger,
  type ProtectedContext,
  type PublicContext,
} from './transport/tanstack/server-context';

const serverContextTools = createServerContextTools({ getAuthGateway });

export { auth, getAuthGateway };
export type { Auth };
export const assertPermission = serverContextTools.assertPermission;
export const withProtectedContext = serverContextTools.withProtectedContext;
export const withProtectedMutation = serverContextTools.withProtectedMutation;
export const withPublicContext = serverContextTools.withPublicContext;
