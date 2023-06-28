import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const authContract = c.router({
  authenticate: {
    method: 'POST',
    path: '/authenticate',
    body: z.object({
      username: z.string(),
      password: z.string(),
    }),
    responses: {
      200: z.object({
        id_token: z.string(),
      }),
      400: z.object({
        title: z.string(),
        errorKey: z.string(),
      }),
    },
  },
});
