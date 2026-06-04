import {
  getAuth,
  getAuthHttpGateway,
  getAuthUseCases,
} from '@/composition/auth';
import { getKernel } from '@/composition/kernel';
import { telemetryProxy } from '@/composition/telemetry';
import type { Logger } from '@/modules/kernel';

import { createServerContextTools } from './transport/tanstack/server-context';

export type { AuthenticatedSession, AuthenticatedUser } from './domain/session';
export {
  createServerContextTools,
  type ProcedureLogger,
  type ProtectedContext,
  type PublicContext,
} from './transport/tanstack/server-context';

const kernelLogger: Logger = {
  debug: (fields) => getKernel().logger.debug(fields),
  info: (fields) => getKernel().logger.info(fields),
  warn: (fields) => getKernel().logger.warn(fields),
  error: (fields) => getKernel().logger.error(fields),
};

const serverContextTools = createServerContextTools({
  getAuthUseCases,
  logger: kernelLogger,
  telemetry: telemetryProxy,
});

export { getAuthUseCases };
export const handleAuthRequest = (request: Request) =>
  telemetryProxy.startSpan(
    {
      attributes: {
        'auth.provider': 'better-auth',
        'http.request.method': request.method,
        'operation.name': 'auth.httpRequest',
        'operation.type': 'http_handler',
      },
      name: 'auth.httpRequest',
      op: 'auth.http',
    },
    () => getAuthHttpGateway().handle(request)
  );
export const handleLogoutRequest = (request: Request) =>
  telemetryProxy.startSpan(
    {
      attributes: {
        'auth.provider': 'better-auth',
        'http.request.method': request.method,
        'operation.name': 'auth.signOut',
        'operation.type': 'provider_operation',
      },
      name: 'auth.signOut',
      op: 'auth.provider',
    },
    () =>
      getAuth().api.signOut({
        asResponse: true,
        headers: request.headers,
      })
  );
export const assertPermission = serverContextTools.assertPermission;
export const withProtectedContext = serverContextTools.withProtectedContext;
export const withProtectedMutation = serverContextTools.withProtectedMutation;
export const withPublicContext = serverContextTools.withPublicContext;
