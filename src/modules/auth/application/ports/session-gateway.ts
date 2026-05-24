import type { AuthSession } from '../../domain/session';

export interface SessionGateway {
  getSession(input: { headers: Headers }): Promise<AuthSession | null>;
}
