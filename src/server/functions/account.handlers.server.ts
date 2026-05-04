import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { zFormFieldsAccountUpdateName } from '@/features/account/schema';
import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { user } from '@/server/db/schema';
import type { ProtectedContext } from '@/server/middlewares.server';
import { ServerFnError } from '@/server/server-fn-error';

const submitOnboarding = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zFormFieldsOnboarding>>
) => {
  ctx.logger.info('Update user');
  const [updatedUser] = await ctx.db
    .update(user)
    .set({
      ...data,
      onboardedAt: new Date(),
    })
    .where(eq(user.id, ctx.user.id))
    .returning({ id: user.id });

  if (!updatedUser) {
    throw new ServerFnError('NOT_FOUND', {
      message: 'Account not found',
    });
  }
};

const updateInfo = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zUpdateInfoInput>>
) => {
  ctx.logger.info('Update user');
  const [updatedUser] = await ctx.db
    .update(user)
    .set({
      name: data.name,
    })
    .where(eq(user.id, ctx.user.id))
    .returning({ id: user.id });

  if (!updatedUser) {
    throw new ServerFnError('NOT_FOUND', {
      message: 'Account not found',
    });
  }
};

export type AccountHandlers = {
  submitOnboarding: typeof submitOnboarding;
  updateInfo: typeof updateInfo;
};

export const handlers: AccountHandlers = {
  submitOnboarding,
  updateInfo,
};

export const zUpdateInfoInput = () => zFormFieldsAccountUpdateName();
