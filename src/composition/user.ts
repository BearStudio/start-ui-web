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
    const [{ getRequestHeaders }, { getAuth }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const response = await getAuth().api.removeUser({
      body: { userId },
      headers: getRequestHeaders(),
    });
    return response.success;
  },
  async revokeUserSessions(userId) {
    const [{ getRequestHeaders }, { getAuth }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const response = await getAuth().api.revokeUserSessions({
      body: { userId },
      headers: getRequestHeaders(),
    });
    return response.success;
  },
  async revokeUserSession(sessionToken) {
    const [{ getRequestHeaders }, { getAuth }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const response = await getAuth().api.revokeUserSession({
      body: { sessionToken },
      headers: getRequestHeaders(),
    });
    return response.success;
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
