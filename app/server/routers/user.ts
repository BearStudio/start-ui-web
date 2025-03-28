import { z } from 'zod';

import { zFormFieldsOnboarding } from '@/features/auth/schemas';
import { protectedProcedure } from '@/server/orpc';

const tags = ['user'];

export default {
  submitOnboarding: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/user/onboarding',
      tags,
    })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          onboardingAt: new Date(),
        },
      });
    }),
};
