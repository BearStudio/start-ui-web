import { z } from 'zod';

import { publicProcedure } from '@/server/config/orpc';

const tags = ['auth'];

export default {
  checkAuthenticated: publicProcedure
    .route({
      method: 'GET',
      path: '/auth/check',
      tags,
    })
    .input(z.object({}).default({}))
    .output(
      z.object({
        isAuthenticated: z.boolean(),
        // authorizations: z.array(zUserAuthorization()).optional(),
      })
    )
    .handler(({ context }) => {
      // TODO Logger
      return {
        isAuthenticated: !!context.user,
        authorizations: context.user?.authorizations,
      };
    }),
};
