import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';

import type { UserAuthGateway } from '../ports/user-auth-gateway';
import type { UserRepository } from '../ports/user-repository';

export type UserUseCaseDeps = {
  userRepository: UserRepository;
  userAuthGateway: UserAuthGateway;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type UseCaseResult<T, TReason extends string> =
  | { ok: true; value: T }
  | { ok: false; reason: TReason };
