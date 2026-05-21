import { z } from 'zod';

import { getAccountUseCases } from '@/composition/account';
import type { ProtectedContext } from '@/modules/auth/server';
import { toUserId } from '@/modules/kernel/domain/ids';
import { throwServerFnErrorForReason } from '@/modules/kernel/transport/tanstack/result-mapper';

export const zSubmitOnboardingInput = () =>
  z.object({ name: z.string().trim().min(1) });
export const zUpdateInfoInput = () =>
  z.object({ name: z.string().trim().min(1) });

const getUseCases = (ctx: ProtectedContext) =>
  getAccountUseCases({
    overrides: {
      logger: {
        info: (event, fields) => ctx.logger.info(fields ?? {}, event),
        warn: (event, fields) => ctx.logger.warn(fields ?? {}, event),
        error: (event, fields) => ctx.logger.error(fields ?? {}, event),
      },
    },
  });

const submitOnboarding = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zSubmitOnboardingInput>>
) => {
  const result = await getUseCases(ctx).submitOnboarding({
    currentUserId: toUserId(ctx.user.id),
    name: data.name,
  });
  if (!result.ok) {
    throwServerFnErrorForReason(result.reason, {
      invalid: { code: 'BAD_REQUEST', message: 'Account name is required' },
      not_found: { code: 'NOT_FOUND', message: 'Account not found' },
    });
  }
};

const updateInfo = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zUpdateInfoInput>>
) => {
  const result = await getUseCases(ctx).updateInfo({
    currentUserId: toUserId(ctx.user.id),
    name: data.name,
  });
  if (!result.ok) {
    throwServerFnErrorForReason(result.reason, {
      invalid: { code: 'BAD_REQUEST', message: 'Account name is required' },
      not_found: { code: 'NOT_FOUND', message: 'Account not found' },
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
