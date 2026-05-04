import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, asc, desc, eq, gt, ilike, lt, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { zUser } from '@/features/user/schema';
import { auth } from '@/server/auth';
import { session, user } from '@/server/db/schema';
import {
  assertPermission,
  type ProtectedContext,
} from '@/server/middlewares.server';
import { ServerFnError } from '@/server/server-fn-error';

type UserSessionListItem = Pick<
  typeof session.$inferSelect,
  'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'ipAddress' | 'userAgent'
>;

const toUserSessionListItem = (
  item: UserSessionListItem | typeof session.$inferSelect
): UserSessionListItem => ({
  id: item.id,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  expiresAt: item.expiresAt,
  ipAddress: item.ipAddress,
  userAgent: item.userAgent,
});

export const zGetAllInput = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional().prefault(''),
    })
    .prefault({});

const getAll = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetAllInput>>
) => {
  await assertPermission(ctx.user.id, { user: ['list'] });

  ctx.logger.info('Getting users from database');

  const searchPattern = `%${data.searchTerm}%`;
  const searchFilter = data.searchTerm
    ? or(ilike(user.name, searchPattern), ilike(user.email, searchPattern))
    : undefined;

  const cursorRow = data.cursor
    ? await ctx.db.query.user.findFirst({
        where: eq(user.id, data.cursor),
        columns: { id: true, name: true },
      })
    : undefined;

  if (data.cursor && !cursorRow) {
    const [totalResult] = await ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(user)
      .where(searchFilter);

    return {
      items: [],
      nextCursor: undefined,
      total: totalResult?.count ?? 0,
    };
  }

  const cursorFilter = cursorRow
    ? or(
        gt(user.name, cursorRow.name),
        and(eq(user.name, cursorRow.name), gt(user.id, cursorRow.id))
      )
    : undefined;

  const where = and(searchFilter, cursorFilter);

  const [total, items] = await Promise.all([
    ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(user)
      .where(searchFilter),
    ctx.db.query.user.findMany({
      where,
      orderBy: [asc(user.name), asc(user.id)],
      limit: data.limit + 1,
    }),
  ]);

  let nextCursor: typeof data.cursor | undefined = undefined;
  if (items.length > data.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return { items, nextCursor, total: total[0]?.count ?? 0 };
};

export const zGetByIdInput = () => z.object({ id: z.string() });

const getById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zGetByIdInput>>
) => {
  await assertPermission(ctx.user.id, { user: ['list'] });

  ctx.logger.info('Getting user');
  const result = await ctx.db.query.user.findFirst({
    where: eq(user.id, data.id),
  });

  if (!result) {
    ctx.logger.warn('Unable to find user with the provided input');
    throw new ServerFnError('NOT_FOUND');
  }

  return result;
};

export const zUpdateByIdInput = () =>
  zUser().pick({ id: true, name: true, email: true, role: true });

const updateById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zUpdateByIdInput>>
) => {
  await assertPermission(ctx.user.id, { user: ['update'] });

  ctx.logger.info('Getting current user');
  const currentUser = await ctx.db.query.user.findFirst({
    where: eq(user.id, data.id),
    columns: { email: true, role: true },
  });

  if (!currentUser) {
    ctx.logger.warn('Unable to find user with the provided input');
    throw new ServerFnError('NOT_FOUND');
  }

  const nextRole =
    ctx.user.id === data.id ? undefined : (data.role ?? undefined);
  const isChangingRole =
    nextRole !== undefined && nextRole !== currentUser.role;

  if (isChangingRole) {
    await assertPermission(ctx.user.id, { user: ['set-role'] });
  }

  ctx.logger.info('Update user');
  const [updated] = await ctx.db
    .update(user)
    .set({
      name: data.name ?? '',
      // Prevent changing the connected user's own role.
      role: nextRole,
      email: data.email,
      emailVerified: currentUser.email !== data.email ? false : undefined,
    })
    .where(eq(user.id, data.id))
    .returning();

  if (!updated) {
    throw new ServerFnError('NOT_FOUND');
  }

  return updated;
};

export const zCreateInput = () =>
  zUser().pick({ name: true, email: true, role: true });

const create = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zCreateInput>>
) => {
  await assertPermission(ctx.user.id, { user: ['create'] });

  ctx.logger.info('Create user');
  const [created] = await ctx.db
    .insert(user)
    .values({
      email: data.email,
      emailVerified: true,
      name: data.name ?? '',
      role: data.role ?? 'user',
    })
    .returning();

  if (!created) {
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }

  return created;
};

export const zDeleteByIdInput = () => zUser().pick({ id: true });

const deleteById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zDeleteByIdInput>>
) => {
  await assertPermission(ctx.user.id, { user: ['delete'] });

  if (ctx.user.id === data.id) {
    ctx.logger.warn('Prevent to delete the current connected user');
    throw new ServerFnError('BAD_REQUEST', {
      message: 'You cannot delete yourself',
    });
  }

  ctx.logger.info('Delete user');
  const response = await auth.api.removeUser({
    body: { userId: data.id },
    headers: getRequestHeaders(),
  });

  if (!response.success) {
    ctx.logger.error('Failed to delete the user');
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }
};

export const zGetUserSessionsInput = () =>
  z.object({
    userId: z.string(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).prefault(20),
  });

const getUserSessions = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetUserSessionsInput>>
) => {
  await assertPermission(ctx.user.id, { session: ['list'] });

  ctx.logger.info('Getting user sessions from database');

  const userIdFilter = eq(session.userId, data.userId);

  const cursorRow = data.cursor
    ? await ctx.db.query.session.findFirst({
        where: and(
          eq(session.id, data.cursor),
          eq(session.userId, data.userId)
        ),
        columns: { id: true, createdAt: true },
      })
    : undefined;

  if (data.cursor && !cursorRow) {
    const [totalResult] = await ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(session)
      .where(userIdFilter);

    return {
      items: [],
      nextCursor: undefined,
      total: totalResult?.count ?? 0,
    };
  }

  const cursorFilter = cursorRow
    ? or(
        and(
          eq(session.createdAt, cursorRow.createdAt),
          gt(session.id, cursorRow.id)
        ),
        lt(session.createdAt, cursorRow.createdAt)
      )
    : undefined;

  const where = and(userIdFilter, cursorFilter);

  const [total, items] = await Promise.all([
    ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(session)
      .where(userIdFilter),
    ctx.db.query.session.findMany({
      where,
      columns: {
        id: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: [desc(session.createdAt), asc(session.id)],
      limit: data.limit + 1,
    }),
  ]);

  let nextCursor: typeof data.cursor | undefined = undefined;
  if (items.length > data.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return {
    items: items.map(toUserSessionListItem),
    nextCursor,
    total: total[0]?.count ?? 0,
  };
};

export const zRevokeUserSessionsInput = () => z.object({ id: z.string() });

const revokeUserSessions = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zRevokeUserSessionsInput>>
) => {
  await assertPermission(ctx.user.id, { session: ['revoke'] });

  if (ctx.user.id === data.id) {
    ctx.logger.warn(
      'Prevent to revoke all sesssions of the current connected user'
    );
    throw new ServerFnError('BAD_REQUEST', {
      message: 'You cannot revoke all your sessions',
    });
  }

  ctx.logger.info('Revoke all user sessions');
  const response = await auth.api.revokeUserSessions({
    body: { userId: data.id },
    headers: getRequestHeaders(),
  });

  if (!response.success) {
    ctx.logger.error('Failed to revoke all the user sessions');
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }
};

export const zRevokeUserSessionInput = () =>
  z.object({ id: z.string(), sessionId: z.string() });

const revokeUserSession = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zRevokeUserSessionInput>>
) => {
  await assertPermission(ctx.user.id, { session: ['revoke'] });

  const targetSession = await ctx.db.query.session.findFirst({
    where: and(eq(session.id, data.sessionId), eq(session.userId, data.id)),
    columns: { id: true, token: true },
  });

  if (!targetSession) {
    throw new ServerFnError('NOT_FOUND');
  }

  if (ctx.session.id === targetSession.id) {
    ctx.logger.warn('Prevent to revoke the current connected user session');
    throw new ServerFnError('BAD_REQUEST', {
      message: 'You cannot revoke your current session',
    });
  }

  ctx.logger.info('Revoke user session');
  const response = await auth.api.revokeUserSession({
    body: { sessionToken: targetSession.token },
    headers: getRequestHeaders(),
  });

  if (!response.success) {
    ctx.logger.error('Failed to revoke the user session');
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }
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
