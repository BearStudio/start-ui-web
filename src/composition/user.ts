import {
  createUserUseCases,
  type UserAuthGateway,
  type UserRepository,
} from '@/modules/user';
import { UserRepositoryDrizzle } from '@/modules/user/infrastructure/drizzle/user-repository-drizzle';

import { getKernel, type Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

const createProductionUserAuthGateway = (): UserAuthGateway => ({
  async removeUser(userId) {
    const [{ getRequestHeaders }, { getAuthGateway }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    return getAuthGateway().removeUser({
      userId,
      headers: getRequestHeaders(),
    });
  },
  async revokeUserSessions(userId) {
    const [{ getRequestHeaders }, { getAuthGateway }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    return getAuthGateway().revokeUserSessions({
      userId,
      headers: getRequestHeaders(),
    });
  },
  async revokeUserSession(target) {
    const [{ getRequestHeaders }, { getAuthGateway }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    return getAuthGateway().revokeUserSession({
      sessionId: target.id,
      providerSessionToken: target.providerToken,
      headers: getRequestHeaders(),
    });
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
      overrides?.userRepository ?? new UserRepositoryDrizzle(kernel.db),
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
