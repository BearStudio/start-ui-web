import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { UseCaseResult } from '@/modules/kernel/application/result';

import type { UserAuthGateway } from '../ports/user-auth-gateway';
import type { UserRepository } from '../ports/user-repository';

export type UserUseCaseDeps = {
  userRepository: UserRepository;
  userAuthGateway: UserAuthGateway;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type { UseCaseResult };
