import { z } from 'zod';

import { zUserAuthorization } from '@/features/user/schemas';
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
        authorizations: z.array(zUserAuthorization()).optional(),
      })
    )
    .handler(({ context }) => {
      context.logger.info(`User ${context.user ? 'is' : 'is not'} logged`);
      return {
        isAuthenticated: !!context.user,
        authorizations: context.user?.authorizations,
      };
    }),
};
