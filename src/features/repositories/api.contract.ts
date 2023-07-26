import { ClientInferResponseBody, initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export type Repository = z.infer<ReturnType<typeof zRepository>>;
export const zRepository = () =>
  z.object({
    id: z.number(),
    name: z.string(),
    link: z.string(),
    description: z.string().nullish(),
  });

export type RepositoryList = ClientInferResponseBody<
  (typeof repositoriesContract)['getAll'],
  200
>;

export const repositoriesContract = c.router({
  getById: {
    method: 'GET',
    path: '/repositories/:id',
    responses: {
      200: zRepository(),
    },
  },
  getAll: {
    method: 'GET',
    path: '/repositories',
    query: z.object({
      page: z.number().int().gte(0).default(0),
      size: z.number().int().gte(1).default(20),
      sort: z.array(z.string()).optional(),
    }),
    responses: {
      200: z.array(zRepository()),
    },
  },
  update: {
    method: 'PUT',
    path: '/repositories',
    body: zRepository(),
    responses: {
      200: zRepository().partial(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  create: {
    method: 'POST',
    path: '/repositories',
    body: zRepository().pick({
      name: true,
      link: true,
      description: true,
    }),
    responses: {
      200: zRepository(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  remove: {
    method: 'DELETE',
    path: '/repositories/:id',
    body: z.void(),
    responses: {
      200: z.void(),
    },
  },
});
