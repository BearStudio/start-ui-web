import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zUser } from '@/features/user/schema';
import { dbSchemas } from '@/server/db';
import { protectedProcedure } from '@/server/orpc';

const tags = ['account'];

export default {
  submitOnboarding: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/submit-onboarding',
      tags,
    })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db
        .update(dbSchemas.user)
        .set({ ...input, onboardedAt: new Date() })
        .where(eq(dbSchemas.user.id, context.user.id));
    }),

  updateInfo: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/info',
      tags,
    })
    .input(
      zUser().pick({
        name: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db
        .update(dbSchemas.user)
        .set({ name: input.name ?? '' })
        .where(eq(dbSchemas.user.id, context.user.id));
    }),
};
