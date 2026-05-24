import type { AuthEmailPort } from '../ports/auth-email-port';
import type { AuthorizationGateway } from '../ports/authorization-gateway';
import type { SessionGateway } from '../ports/session-gateway';
import type { UserAdminGateway } from '../ports/user-admin-gateway';

export type AuthUseCaseDeps = {
  sessionGateway: SessionGateway;
  authorizationGateway: AuthorizationGateway;
  authEmailPort: AuthEmailPort;
  userAdminGateway: UserAdminGateway;
};

export type UseCaseResult<T, TReason extends string> =
  | { ok: true; value: T }
  | { ok: false; reason: TReason };
