import { z } from 'zod';

import type { AccountUseCases } from '@/modules/account';
import type { ProtectedContext } from '@/modules/auth/server';
import { throwServerFnErrorForReason } from '@/modules/kernel/transport/tanstack/result-mapper';

export const zSubmitOnboardingInput = () =>
  z.object({ name: z.string().trim().min(1) });
export const zUpdateInfoInput = () =>
  z.object({ name: z.string().trim().min(1) });

type AccountHandlerDeps = {
  getUseCases: (ctx: ProtectedContext) => AccountUseCases;
};

export const createAccountHandlers = ({ getUseCases }: AccountHandlerDeps) => {
  const submitOnboarding = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zSubmitOnboardingInput>>
  ) => {
    const result = await getUseCases(ctx).submitOnboarding({
      scope: ctx.scope,
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
      scope: ctx.scope,
      name: data.name,
    });
    if (!result.ok) {
      throwServerFnErrorForReason(result.reason, {
        invalid: { code: 'BAD_REQUEST', message: 'Account name is required' },
        not_found: { code: 'NOT_FOUND', message: 'Account not found' },
      });
    }
  };

  return {
    submitOnboarding,
    updateInfo,
  };
};

export type AccountHandlers = ReturnType<typeof createAccountHandlers>;
