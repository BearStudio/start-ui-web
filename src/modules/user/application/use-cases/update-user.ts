import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserResult, UserUpdateOutcome, UserUseCaseDeps } from './types';
import type { UserUpdateInput } from '../../domain/user';
import { shouldUnverifyEmail } from '../../domain/user';
import { canChangeRole } from '../../domain/user-policy';

export type UpdateUserInput = {
  scope: RequestScope;
  id: UserId;
  user: UserUpdateInput;
};

export async function updateUser(
  deps: UserUseCaseDeps,
  input: UpdateUserInput
): Promise<UserResult<UserUpdateOutcome>> {
  const currentUserId = scopeUserId(input.scope);
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['update'] },
  });
  const permission = match(allowed)
    .with(Result.P.Error(P.select()), (error) => ({
      type: 'error' as const,
      error,
    }))
    .with(Result.P.Ok({ type: 'permission_denied' }), () => ({
      type: 'denied' as const,
    }))
    .with(Result.P.Ok({ type: 'permission_granted' }), () => ({
      type: 'granted' as const,
    }))
    .exhaustive();
  if (permission.type === 'error') return Result.Error(permission.error);
  if (permission.type === 'denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }

  const currentResult = await deps.userRepository.getUpdateSnapshot(input.id);
  const currentSnapshot = match(currentResult)
    .with(Result.P.Error(P.select()), (error) => ({
      type: 'error' as const,
      error,
    }))
    .with(Result.P.Ok({ type: 'user_not_found' }), () => ({
      type: 'not-found' as const,
    }))
    .with(
      Result.P.Ok({
        type: 'user_update_snapshot_found',
        snapshot: P.select(),
      }),
      (snapshot) => ({ type: 'found' as const, snapshot })
    )
    .exhaustive();
  if (currentSnapshot.type === 'error') {
    return Result.Error(currentSnapshot.error);
  }
  if (currentSnapshot.type === 'not-found') {
    return Result.Ok({ type: 'user_not_found' });
  }
  const current = currentSnapshot.snapshot;

  const nextRole =
    currentUserId === input.id ? undefined : (input.user.role ?? undefined);

  if (
    canChangeRole({
      currentUserId,
      userId: input.id,
      nextRole,
      currentRole: current.role,
    })
  ) {
    const canSetRole = await hasScopePermission({
      permissionChecker: deps.permissionChecker,
      scope: input.scope,
      permissions: { user: ['set-role'] },
    });
    const setRolePermission = match(canSetRole)
      .with(Result.P.Error(P.select()), (error) => ({
        type: 'error' as const,
        error,
      }))
      .with(Result.P.Ok({ type: 'permission_denied' }), () => ({
        type: 'denied' as const,
      }))
      .with(Result.P.Ok({ type: 'permission_granted' }), () => ({
        type: 'granted' as const,
      }))
      .exhaustive();
    if (setRolePermission.type === 'error') {
      return Result.Error(setRolePermission.error);
    }
    if (setRolePermission.type === 'denied') {
      return Result.Ok({ type: 'user_forbidden' });
    }
  }

  deps.logger.info({
    event: 'user.update',
    details: { userId: input.id },
  });
  const update = {
    email: input.user.email,
    role: nextRole,
    emailVerified: shouldUnverifyEmail(current.email, input.user.email)
      ? false
      : undefined,
    ...(input.user.name === undefined ? {} : { name: input.user.name ?? '' }),
  };
  const result = await deps.userRepository.update(input.id, {
    ...update,
  });
  return match(result)
    .with(Result.P.Error(P.select()), (error) => Result.Error(error))
    .with(Result.P.Ok(P.select()), (outcome) => Result.Ok(outcome))
    .exhaustive();
}
