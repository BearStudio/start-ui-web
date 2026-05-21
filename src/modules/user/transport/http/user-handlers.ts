import { z } from 'zod';

import { getUserUseCases } from '@/composition/user';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import type { UserRole } from '@/modules/user/domain/user';
import type { ProtectedContext } from '@/server/middlewares.server';
import { ServerFnError } from '@/server/server-fn-error';

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

const getUseCases = (ctx: ProtectedContext) =>
  getUserUseCases({
    overrides: {
      db: ctx.db,
      logger: {
        info: (event, fields) => ctx.logger.info(fields ?? {}, event),
        warn: (event, fields) => ctx.logger.warn(fields ?? {}, event),
        error: (event, fields) => ctx.logger.error(fields ?? {}, event),
      },
    },
  });

const mapReason = (reason: string): never => {
  if (reason === 'forbidden') throw new ServerFnError('FORBIDDEN');
  if (reason === 'not_found') throw new ServerFnError('NOT_FOUND');
  if (reason === 'duplicate') {
    throw new ServerFnError('CONFLICT', {
      message: 'Unique constraint violation',
      data: { target: ['email'] },
    });
  }
  if (reason === 'self') {
    throw new ServerFnError('BAD_REQUEST');
  }
  throw new ServerFnError('INTERNAL_SERVER_ERROR');
};

const mapThrownError = (error: unknown): never => {
  if (error instanceof AppError) {
    if (error.category === 'conflict') {
      throw new ServerFnError('CONFLICT', {
        message: error.message,
        data: error.details,
      });
    }
    if (error.category === 'bad_request') {
      throw new ServerFnError('BAD_REQUEST', { message: error.message });
    }
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }
  throw error;
};

const getAll = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetAllInput>>
) => {
  const result = await getUseCases(ctx)
    .list({
      currentUserId: toUserId(ctx.user.id),
      cursor: data.cursor ? toUserId(data.cursor) : undefined,
      limit: data.limit,
      searchTerm: data.searchTerm ?? '',
    })
    .catch(mapThrownError);
  if (result.ok) return result.value;
  return mapReason(result.reason);
};

const getById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zGetByIdInput>>
) => {
  const result = await getUseCases(ctx)
    .get({
      currentUserId: toUserId(ctx.user.id),
      id: toUserId(data.id),
    })
    .catch(mapThrownError);
  if (result.ok) return result.value;
  return mapReason(result.reason);
};

const updateById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zUpdateByIdInput>>
) => {
  const result = await getUseCases(ctx)
    .update({
      currentUserId: toUserId(ctx.user.id),
      id: toUserId(data.id),
      user: {
        name: data.name,
        email: toEmailAddress(data.email),
        role: data.role as UserRole | null | undefined,
      },
    })
    .catch(mapThrownError);
  if (result.ok) return result.value;
  return mapReason(result.reason);
};

const create = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zCreateInput>>
) => {
  const result = await getUseCases(ctx)
    .create({
      currentUserId: toUserId(ctx.user.id),
      user: {
        name: data.name,
        email: toEmailAddress(data.email),
        role: data.role as UserRole | null | undefined,
      },
    })
    .catch(mapThrownError);
  if (result.ok) return result.value;
  return mapReason(result.reason);
};

const deleteById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zDeleteByIdInput>>
) => {
  const result = await getUseCases(ctx)
    .delete({
      currentUserId: toUserId(ctx.user.id),
      id: toUserId(data.id),
    })
    .catch(mapThrownError);
  if (result.ok) return;
  return mapReason(result.reason);
};

const getUserSessions = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetUserSessionsInput>>
) => {
  const result = await getUseCases(ctx)
    .listSessions({
      currentUserId: toUserId(ctx.user.id),
      userId: toUserId(data.userId),
      cursor: data.cursor ? toSessionId(data.cursor) : undefined,
      limit: data.limit,
    })
    .catch(mapThrownError);
  if (result.ok) return result.value;
  return mapReason(result.reason);
};

const revokeUserSessions = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zRevokeUserSessionsInput>>
) => {
  const result = await getUseCases(ctx)
    .revokeSessions({
      currentUserId: toUserId(ctx.user.id),
      id: toUserId(data.id),
    })
    .catch(mapThrownError);
  if (result.ok) return;
  return mapReason(result.reason);
};

const revokeUserSession = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zRevokeUserSessionInput>>
) => {
  const result = await getUseCases(ctx)
    .revokeSession({
      currentUserId: toUserId(ctx.user.id),
      currentSessionId: toSessionId(ctx.session.id),
      id: toUserId(data.id),
      sessionId: toSessionId(data.sessionId),
    })
    .catch(mapThrownError);
  if (result.ok) return;
  return mapReason(result.reason);
};

export type UserHandlers = {
  getAll: typeof getAll;
  getById: typeof getById;
  updateById: typeof updateById;
  create: typeof create;
  deleteById: typeof deleteById;
  getUserSessions: typeof getUserSessions;
  revokeUserSessions: typeof revokeUserSessions;
  revokeUserSession: typeof revokeUserSession;
};

export const handlers: UserHandlers = {
  getAll,
  getById,
  updateById,
  create,
  deleteById,
  getUserSessions,
  revokeUserSessions,
  revokeUserSession,
};
