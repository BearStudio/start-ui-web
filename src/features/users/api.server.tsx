import { createNextRoute } from '@ts-rest/next';

import { contract } from '@/api/contract';
import { db } from '@/api/db';
import {
  apiGuard,
  errorResponseNotFound,
  errorResponseNotSignedIn,
  errorResponseUnknown,
} from '@/api/helpers';
import { User } from '@/features/users/api.contract';
import {
  userErrorResponse,
  userFormatFromDb,
  userPrepareForDb,
} from '@/features/users/helpers.server';

export const usersRouter = createNextRoute(contract.users, {
  create: async ({ req, body }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;

    const user = userFormatFromDb(
      await db.user.create({
        data: userPrepareForDb(body),
      })
    );

    if (!user) return errorResponseUnknown;

    return {
      status: 200,
      body: user,
    };
  },
  getAll: async ({ req, res, query }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;
    const [users, total] = await Promise.all([
      db.user.findMany({
        skip: query.page * query.size,
        take: query.size,
      }),
      db.user.count(),
    ]);

    res.setHeader('x-total-count', total.toString());

    return {
      status: 200,
      body: users.map(userFormatFromDb) as User[],
    };
  },
  getByLogin: async ({ req, params }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;

    const user = userFormatFromDb(
      await db.user.findUnique({ where: { login: params.login } })
    );

    if (!user) return errorResponseNotFound;

    return {
      status: 200,
      body: user,
    };
  },
  remove: async ({ req, params }) => {
    const { success, errorResponse, user } = await apiGuard(req);
    if (!success) return errorResponse;
    if (!user) return errorResponseNotSignedIn;

    await db.user.delete({
      where: { login: params.login, NOT: { id: user.id } },
    });

    return {
      status: 200,
      body: {},
    };
  },
  update: async ({ req, body }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;
    try {
      // Drop some fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdBy, createdDate, ...data } = userPrepareForDb(body);

      const user = userFormatFromDb(
        await db.user.update({
          where: { id: body.id },
          data,
        })
      );

      if (!user) return errorResponseUnknown;

      return {
        status: 200,
        body: user,
      };
    } catch (e) {
      return userErrorResponse(e);
    }
  },
});
