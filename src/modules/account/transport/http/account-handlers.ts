import { z } from 'zod';

import type { AccountUseCases } from '@/modules/account';
import type { ProtectedContext } from '@/modules/auth/backend';
import { unwrapUseCaseResult } from '@/modules/kernel/transport/tanstack/result-mapper';

export const zSubmitOnboardingInput = () =>
  z.object({ name: z.string().trim().min(1) });
export const zUpdateInfoInput = () =>
  z.object({ name: z.string().trim().min(1) });

type AccountHandlerDeps = {
  getUseCases: (ctx: ProtectedContext) => AccountUseCases;
};

const accountReasonConfig = {
  forbidden: { code: 'FORBIDDEN', message: 'Forbidden' },
  invalid: { code: 'BAD_REQUEST', message: 'Account name is required' },
  not_found: { code: 'NOT_FOUND', message: 'Account not found' },
} as const;

export const createAccountHandlers = ({ getUseCases }: AccountHandlerDeps) => {
  const submitOnboarding = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zSubmitOnboardingInput>>
  ) => {
    await unwrapUseCaseResult(
      getUseCases(ctx).submitOnboarding({
        scope: ctx.scope,
        name: data.name,
      }),
      accountReasonConfig
    );
  };

  const updateInfo = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zUpdateInfoInput>>
  ) => {
    await unwrapUseCaseResult(
      getUseCases(ctx).updateInfo({
        scope: ctx.scope,
        name: data.name,
      }),
      accountReasonConfig
    );
  };

  return {
    submitOnboarding,
    updateInfo,
  };
};

export type AccountHandlers = ReturnType<typeof createAccountHandlers>;
