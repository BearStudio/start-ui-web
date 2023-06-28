import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import { zUser } from '@/features/users/contract';

const c = initContract();

export const accountContract = c.router({
  get: {
    method: 'GET',
    path: '/account',
    responses: {
      200: zUser(),
    },
  },
  register: {
    method: 'POST',
    path: '/register',
    body: zUser()
      .pick({ login: true, email: true, langKey: true })
      .merge(z.object({ password: z.string() })),
    responses: {
      200: z.void(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  activate: {
    method: 'GET',
    path: '/activate',
    query: z.object({
      key: z.string(),
    }),
    responses: {
      200: z.void(),
    },
  },
  update: {
    method: 'POST',
    path: '/account',
    body: zUser().partial(),
    responses: {
      200: z.void(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  resetPasswordInit: {
    method: 'POST',
    path: '/account/reset-password/init',
    body: z.string(),
    responses: {
      200: z.void(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  resetPasswordFinish: {
    method: 'POST',
    path: '/account/reset-password/init',
    body: z.object({
      key: z.string(),
      newPassword: z.string(),
    }),
    responses: {
      200: z.void(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
  updatePassword: {
    method: 'POST',
    path: '/account/change-password',
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
    }),
    responses: {
      200: z.void(),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
});
