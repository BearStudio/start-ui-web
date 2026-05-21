import { getRequestHeaders } from '@tanstack/react-start/server';

import type { UserAuthGateway } from '@/modules/user/application/ports/user-auth-gateway';
import type { UserRepository } from '@/modules/user/application/ports/user-repository';
import { createUserUseCases } from '@/modules/user/factory';
import { UserRepositoryDrizzle } from '@/modules/user/infrastructure/drizzle/user-repository-drizzle';
import { auth } from '@/server/auth';

import { getKernel, type KernelOverrides } from './kernel';
import { createCachedFactory } from './shared/singleton';

const productionUserAuthGateway: UserAuthGateway = {
  async removeUser(userId) {
    const response = await auth.api.removeUser({
      body: { userId },
      headers: getRequestHeaders(),
    });
    return response.success;
  },
  async revokeUserSessions(userId) {
    const response = await auth.api.revokeUserSessions({
      body: { userId },
      headers: getRequestHeaders(),
    });
    return response.success;
  },
  async revokeUserSession(sessionToken) {
    const response = await auth.api.revokeUserSession({
      body: { sessionToken },
      headers: getRequestHeaders(),
    });
    return response.success;
  },
};

export type UserCompositionOverrides = KernelOverrides & {
  userRepository?: UserRepository;
  userAuthGateway?: UserAuthGateway;
};

const buildUserUseCases = (overrides?: UserCompositionOverrides) => {
  const kernel = getKernel({ overrides });
  return createUserUseCases({
    userRepository:
      overrides?.userRepository ?? new UserRepositoryDrizzle(kernel.db),
    userAuthGateway: overrides?.userAuthGateway ?? productionUserAuthGateway,
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const getCachedUserUseCases = createCachedFactory(() => buildUserUseCases());

export function getUserUseCases(options?: {
  overrides?: UserCompositionOverrides;
}) {
  if (options?.overrides && Object.keys(options.overrides).length > 0) {
    return buildUserUseCases(options.overrides);
  }
  return getCachedUserUseCases(false);
}
