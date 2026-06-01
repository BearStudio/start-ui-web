import { Result } from '@swan-io/boxed';
import { describe, expect, it } from 'vitest';

import type { ApplicationResult } from '@/modules/kernel/application/result';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  type OutcomeHandlerConfig,
  unwrapApplicationResult,
} from '@/modules/kernel/transport/tanstack/result-mapper';
import { ServerFnError } from '@/modules/kernel/transport/tanstack/server-fn-error';

type TestOutcome =
  | { type: 'test_completed'; value: string }
  | { type: 'test_forbidden' };

describe('tanstack result mapper', () => {
  const handlers = {
    test_completed: (outcome) => outcome.value,
    test_forbidden: 'FORBIDDEN',
  } as const satisfies OutcomeHandlerConfig<TestOutcome, string>;

  it('maps successful tagged outcomes', async () => {
    await expect(
      unwrapApplicationResult(
        Promise.resolve(
          Result.Ok({ type: 'test_completed' as const, value: 'value' })
        ),
        handlers
      )
    ).resolves.toBe('value');
  });

  it('maps expected business outcomes to server function errors', async () => {
    await expect(
      unwrapApplicationResult(
        Promise.resolve(Result.Ok({ type: 'test_forbidden' as const })),
        handlers
      )
    ).rejects.toBeInstanceOf(ServerFnError);
  });

  it('maps app errors to server function errors', async () => {
    await expect(
      unwrapApplicationResult(
        Promise.resolve(
          Result.Error(
            new AppError({
              code: 'DUPLICATE',
              category: 'conflict',
              status: 409,
              message: 'Duplicate',
              details: { target: ['email'] },
              exposeDetails: true,
            })
          )
        ),
        handlers
      )
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      data: { target: ['email'] },
    });
  });

  it('maps thrown app errors for legacy promise boundaries', async () => {
    await expect(
      unwrapApplicationResult(
        Promise.reject(
          new AppError({
            code: 'UNAUTHORIZED',
            category: 'unauthorized',
            status: 401,
            message: 'Unauthorized',
          })
        ) as Promise<ApplicationResult<TestOutcome>>,
        handlers
      )
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});
