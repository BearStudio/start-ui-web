import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/backend';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import {
  type OutcomeHandlerConfig,
  unwrapApplicationResult,
} from '@/modules/kernel/transport/tanstack/result-mapper';
import type { UserRole, UserUseCases } from '@/modules/user';

import type {
  UserCreateOutcome,
  UserDeleteOutcome,
  UserGetOutcome,
  UserListOutcome,
  UserRevokeSessionOutcome,
  UserRevokeSessionsOutcome,
  UserSessionsListOutcome,
  UserUpdateOutcome,
} from '../../application/use-cases/types';
import type {
  User,
  UserListPage,
  UserSessionListPage,
} from '../../domain/user';

const zRole = () => z.enum(['admin', 'user']);

export const zGetAllInput = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional(),
    })
    .prefault({});

export const zGetByIdInput = () => z.object({ id: z.string() });

export const zUpdateByIdInput = () =>
  z.object({
    id: z.string(),
    name: z.string().nullish(),
    email: z.email(),
    role: zRole().nullish(),
  });

export const zCreateInput = () =>
  z.object({
    name: z.string().nullish(),
    email: z.email(),
    role: zRole().nullish(),
  });

export const zDeleteByIdInput = () => z.object({ id: z.string() });

export const zGetUserSessionsInput = () =>
  z.object({
    userId: z.string(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).prefault(20),
  });

export const zRevokeUserSessionsInput = () => z.object({ id: z.string() });

export const zRevokeUserSessionInput = () =>
  z.object({ id: z.string(), sessionId: z.string() });

type UserHandlerDeps = {
  getUseCases: (ctx: ProtectedContext) => UserUseCases;
};

const userDuplicateConfig = {
  user_duplicate: {
    code: 'CONFLICT',
    message: 'Unique constraint violation',
    data: { target: ['email'] },
  },
} as const;

const userSelfConfig = (options?: { selfMessage?: string }) =>
  ({
    user_self: {
      code: 'BAD_REQUEST',
      message: options?.selfMessage ?? 'You cannot target yourself',
    },
  }) as const;

const userListConfig = {
  user_forbidden: 'FORBIDDEN',
  user_listed: (outcome) => outcome.page,
} as const satisfies OutcomeHandlerConfig<UserListOutcome, UserListPage>;

const userGetConfig = {
  user_forbidden: 'FORBIDDEN',
  user_found: (outcome) => outcome.user,
  user_not_found: 'NOT_FOUND',
} as const satisfies OutcomeHandlerConfig<UserGetOutcome, User>;

const userCreateConfig = {
  user_created: (outcome) => outcome.user,
  user_forbidden: 'FORBIDDEN',
  ...userDuplicateConfig,
} as const satisfies OutcomeHandlerConfig<UserCreateOutcome, User>;

const userUpdateConfig = {
  user_forbidden: 'FORBIDDEN',
  user_not_found: 'NOT_FOUND',
  user_updated: (outcome) => outcome.user,
  ...userDuplicateConfig,
} as const satisfies OutcomeHandlerConfig<UserUpdateOutcome, User>;

const userDeleteConfig = (options?: { selfMessage?: string }) =>
  ({
    user_deleted: () => undefined,
    user_forbidden: 'FORBIDDEN',
    ...userSelfConfig(options),
  }) as const satisfies OutcomeHandlerConfig<UserDeleteOutcome, void>;

const userSessionsListConfig = {
  user_forbidden: 'FORBIDDEN',
  user_sessions_listed: (outcome) => outcome.page,
} as const satisfies OutcomeHandlerConfig<
  UserSessionsListOutcome,
  UserSessionListPage
>;

const userRevokeSessionsConfig = (options?: { selfMessage?: string }) =>
  ({
    user_forbidden: 'FORBIDDEN',
    user_sessions_revoked: () => undefined,
    ...userSelfConfig(options),
  }) as const satisfies OutcomeHandlerConfig<UserRevokeSessionsOutcome, void>;

const userRevokeSessionConfig = (options?: { selfMessage?: string }) =>
  ({
    user_forbidden: 'FORBIDDEN',
    user_session_not_found: 'NOT_FOUND',
    user_session_revoked: () => undefined,
    ...userSelfConfig(options),
  }) as const satisfies OutcomeHandlerConfig<UserRevokeSessionOutcome, void>;

export const createUserHandlers = ({ getUseCases }: UserHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).list({
        scope: ctx.scope,
        cursor: data.cursor ? toUserId(data.cursor) : undefined,
        limit: data.limit,
        searchTerm: data.searchTerm ?? '',
      }),
      userListConfig
    );
  };

  const getById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zGetByIdInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).get({
        scope: ctx.scope,
        id: toUserId(data.id),
      }),
      userGetConfig
    );
  };

  const updateById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zUpdateByIdInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).update({
        scope: ctx.scope,
        id: toUserId(data.id),
        user: {
          name: data.name,
          email: toEmailAddress(data.email),
          role: data.role as UserRole | null | undefined,
        },
      }),
      userUpdateConfig
    );
  };

  const create = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zCreateInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).create({
        scope: ctx.scope,
        user: {
          name: data.name,
          email: toEmailAddress(data.email),
          role: data.role as UserRole | null | undefined,
        },
      }),
      userCreateConfig
    );
  };

  const deleteById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zDeleteByIdInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).delete({
        scope: ctx.scope,
        id: toUserId(data.id),
      }),
      userDeleteConfig({ selfMessage: 'You cannot delete yourself' })
    );
  };

  const getUserSessions = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetUserSessionsInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).listSessions({
        scope: ctx.scope,
        userId: toUserId(data.userId),
        cursor: data.cursor ? toSessionId(data.cursor) : undefined,
        limit: data.limit,
      }),
      userSessionsListConfig
    );
  };

  const revokeUserSessions = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zRevokeUserSessionsInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).revokeSessions({
        scope: ctx.scope,
        id: toUserId(data.id),
      }),
      userRevokeSessionsConfig({
        selfMessage: 'You cannot revoke your own sessions',
      })
    );
  };

  const revokeUserSession = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zRevokeUserSessionInput>>
  ) => {
    return unwrapApplicationResult(
      getUseCases(ctx).revokeSession({
        scope: ctx.scope,
        currentSessionId: toSessionId(ctx.session.id),
        id: toUserId(data.id),
        sessionId: toSessionId(data.sessionId),
      }),
      userRevokeSessionConfig({
        selfMessage: 'You cannot revoke your current session',
      })
    );
  };

  return {
    getAll,
    getById,
    updateById,
    create,
    deleteById,
    getUserSessions,
    revokeUserSessions,
    revokeUserSession,
  };
};

export type UserHandlers = ReturnType<typeof createUserHandlers>;
