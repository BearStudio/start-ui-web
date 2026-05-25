import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/server';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import {
  mapAppErrorToServerFnError,
  throwServerFnErrorForReason,
} from '@/modules/kernel/transport/tanstack/result-mapper';
import type { UserUseCases } from '@/modules/user';
import type { UserRole } from '@/modules/user/domain/user';

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

const mapReason = (
  reason: string,
  options?: { selfMessage?: string }
): never => {
  return throwServerFnErrorForReason(reason, {
    duplicate: {
      code: 'CONFLICT',
      message: 'Unique constraint violation',
      data: { target: ['email'] },
    },
    forbidden: 'FORBIDDEN',
    not_found: 'NOT_FOUND',
    self: {
      code: 'BAD_REQUEST',
      message: options?.selfMessage ?? 'You cannot target yourself',
    },
  });
};

export const createUserHandlers = ({ getUseCases }: UserHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    const result = await getUseCases(ctx)
      .list({
        scope: ctx.scope,
        cursor: data.cursor ? toUserId(data.cursor) : undefined,
        limit: data.limit,
        searchTerm: data.searchTerm ?? '',
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const getById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zGetByIdInput>>
  ) => {
    const result = await getUseCases(ctx)
      .get({
        scope: ctx.scope,
        id: toUserId(data.id),
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const updateById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zUpdateByIdInput>>
  ) => {
    const result = await getUseCases(ctx)
      .update({
        scope: ctx.scope,
        id: toUserId(data.id),
        user: {
          name: data.name,
          email: toEmailAddress(data.email),
          role: data.role as UserRole | null | undefined,
        },
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const create = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zCreateInput>>
  ) => {
    const result = await getUseCases(ctx)
      .create({
        scope: ctx.scope,
        user: {
          name: data.name,
          email: toEmailAddress(data.email),
          role: data.role as UserRole | null | undefined,
        },
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const deleteById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zDeleteByIdInput>>
  ) => {
    const result = await getUseCases(ctx)
      .delete({
        scope: ctx.scope,
        id: toUserId(data.id),
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return;
    return mapReason(result.reason, {
      selfMessage: 'You cannot delete yourself',
    });
  };

  const getUserSessions = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetUserSessionsInput>>
  ) => {
    const result = await getUseCases(ctx)
      .listSessions({
        scope: ctx.scope,
        userId: toUserId(data.userId),
        cursor: data.cursor ? toSessionId(data.cursor) : undefined,
        limit: data.limit,
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const revokeUserSessions = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zRevokeUserSessionsInput>>
  ) => {
    const result = await getUseCases(ctx)
      .revokeSessions({
        scope: ctx.scope,
        id: toUserId(data.id),
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return;
    return mapReason(result.reason, {
      selfMessage: 'You cannot revoke your own sessions',
    });
  };

  const revokeUserSession = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zRevokeUserSessionInput>>
  ) => {
    const result = await getUseCases(ctx)
      .revokeSession({
        scope: ctx.scope,
        currentSessionId: toSessionId(ctx.session.id),
        id: toUserId(data.id),
        sessionId: toSessionId(data.sessionId),
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return;
    return mapReason(result.reason, {
      selfMessage: 'You cannot revoke your current session',
    });
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
