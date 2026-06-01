import type { ApplicationResult } from '@/modules/kernel/application/result';

import type { AuthSession } from '../../domain/session';

export type SessionGatewayOutcome =
  | { type: 'auth_session_found'; session: AuthSession }
  | { type: 'auth_session_missing' };

export interface SessionGateway {
  getSession(input: {
    headers: Headers;
  }): Promise<ApplicationResult<SessionGatewayOutcome>>;
}
