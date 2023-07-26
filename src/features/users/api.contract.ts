import { ClientInferResponseBody, initContract } from '@ts-rest/core';
import { z } from 'zod';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

const c = initContract();

export type UserRole = z.infer<ReturnType<typeof zUserRole>>;
export const zUserRole = () => z.enum(['ROLE_ADMIN', 'ROLE_USER']);

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.number(),
    login: z.string(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    email: z.string(),
    activated: z.boolean(),
    langKey: z.string().default(DEFAULT_LANGUAGE_KEY),
    authorities: z.array(zUserRole()),
    createdBy: z.string().nullish(),
    createdDate: z.string().datetime().nullish(),
    lastModifiedBy: z.string().nullish(),
    lastModifiedDate: z.string().datetime().nullish(),
  });

export type UserList = ClientInferResponseBody<
  (typeof usersContract)['getAll'],
  200
>;

export const usersContract = c.router({
  getByLogin: {
    method: 'GET',
    path: '/admin/users/:login',
    responses: {
      200: zUser(),
    },
  },
  getAll: {
    method: 'GET',
    path: '/admin/users',
    query: z.object({
      page: z.number().int().gte(0).default(1),
      size: z.number().int().gte(1).default(20),
      sort: z.array(z.string()).optional(),
    }),
    responses: {
      200: z.array(zUser()),
    },
  },
  update: {
    method: 'PUT',
    path: '/admin/users',
    body: zUser().partial(),
    responses: {
      200: zUser(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  create: {
    method: 'POST',
    path: '/admin/users',
    body: zUser().pick({
      login: true,
      email: true,
      firstName: true,
      lastName: true,
      langKey: true,
      authorities: true,
    }),
    responses: {
      200: zUser(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  remove: {
    method: 'DELETE',
    path: '/admin/users/:login',
    body: z.void(),
    responses: {
      200: z.void(),
    },
  },
});
