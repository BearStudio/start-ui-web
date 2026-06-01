import { Result } from '@swan-io/boxed';

import {
  createUserUseCases,
  type UserAuthGateway,
  type UserRepository,
} from '@/modules/user';
import { createUserRepository } from '@/modules/auth/infrastructure/drizzle/user-repository-drizzle';

import { getKernel, type Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

const createProductionUserAuthGateway = (): UserAuthGateway => ({
  async removeUser(userId) {
    const [{ getRequestHeaders }, { getAuthUseCases }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const result = await getAuthUseCases().removeUser({
      userId,
      headers: getRequestHeaders(),
    });
    if (result.isError()) return Result.Error(result.getError());
    return Result.Ok({ type: 'user_auth_removed' });
  },
  async revokeUserSessions(userId) {
    const [{ getRequestHeaders }, { getAuthUseCases }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const result = await getAuthUseCases().revokeUserSessions({
      userId,
      headers: getRequestHeaders(),
    });
    if (result.isError()) return Result.Error(result.getError());
    return Result.Ok({ type: 'user_auth_sessions_revoked' });
  },
  async revokeUserSession(target) {
    const [{ getRequestHeaders }, { getAuthUseCases }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const result = await getAuthUseCases().revokeUserSession({
      userId: target.userId,
      sessionId: target.sessionId,
      headers: getRequestHeaders(),
    });
    if (result.isError()) return Result.Error(result.getError());
    return Result.Ok({ type: 'user_auth_session_revoked' });
  },
});

export type UserOverrides = {
  kernel?: Kernel;
  userRepository?: UserRepository;
  userAuthGateway?: UserAuthGateway;
};

const buildUserUseCases = (overrides?: UserOverrides) => {
  const kernel = overrides?.kernel ?? getKernel();
  return createUserUseCases({
    userRepository:
      overrides?.userRepository ?? createUserRepository({ db: kernel.db }),
    userAuthGateway:
      overrides?.userAuthGateway ?? createProductionUserAuthGateway(),
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const factory = createCachedFactory(buildUserUseCases);

export const getUserUseCases = (overrides?: UserOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetUserComposition = () => factory.reset();
