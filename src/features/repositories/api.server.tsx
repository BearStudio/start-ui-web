import { createNextRoute } from '@ts-rest/next';

import { contract } from '@/api/contract';
import { db } from '@/api/db';
import {
  apiGuard,
  errorResponseNotFound,
  errorResponseUnknown,
} from '@/api/helpers';
import { repositoryErrorResponse } from '@/features/repositories/helpers.server';

export const repositoriesRouter = createNextRoute(contract.repositories, {
  create: async ({ req, body }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;

    const repository = await db.repository.create({
      data: body,
    });

    if (!repository) return errorResponseUnknown;

    return {
      status: 200,
      body: repository,
    };
  },
  getAll: async ({ req, res, query }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;
    const [repositories, total] = await Promise.all([
      db.repository.findMany({
        skip: query.page * query.size,
        take: query.size,
      }),
      db.repository.count(),
    ]);

    res.setHeader('x-total-count', total.toString());

    return {
      status: 200,
      body: repositories,
    };
  },
  getById: async ({ req, params }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;

    const repository = await db.repository.findUnique({
      where: { id: Number(params.id) },
    });

    if (!repository) return errorResponseNotFound;

    return {
      status: 200,
      body: repository,
    };
  },
  remove: async ({ req, params }) => {
    const { success, errorResponse } = await apiGuard(req);
    if (!success) return errorResponse;

    await db.repository.delete({
      where: { id: Number(params.id) },
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
      const repository = await db.repository.update({
        where: { id: body.id },
        data: body,
      });
      if (!repository) return errorResponseUnknown;

      return {
        status: 200,
        body: repository,
      };
    } catch (e) {
      return repositoryErrorResponse(e);
    }
  },
});
