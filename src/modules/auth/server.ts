import type { Auth } from '@/composition/auth';
import { auth, getAuthUseCases } from '@/composition/auth';
import { telemetryProxy } from '@/composition/telemetry';

import { createServerContextTools } from './transport/tanstack/server-context';

export type { AuthenticatedSession, AuthenticatedUser } from './domain/session';
export {
  createServerContextTools,
  type ProcedureLogger,
  type ProtectedContext,
  type PublicContext,
} from './transport/tanstack/server-context';

const serverContextTools = createServerContextTools({
  getAuthUseCases,
  telemetry: telemetryProxy,
});

export { auth, getAuthUseCases };
export type { Auth };
export const assertPermission = serverContextTools.assertPermission;
export const withProtectedContext = serverContextTools.withProtectedContext;
export const withProtectedMutation = serverContextTools.withProtectedMutation;
export const withPublicContext = serverContextTools.withPublicContext;
