import { Result } from '@swan-io/boxed';
import { describe, expect, it } from 'vitest';

import type { ApplicationResult } from '@/modules/kernel/application/result';
import { AppError } from '@/modules/kernel/domain/errors/app-error';

describe('application result contract', () => {
  it('uses Boxed results for domain-tagged outcomes and app errors', () => {
    const appError = new AppError({
      code: 'TEST_ERROR',
      category: 'system',
      status: 500,
      message: 'Test error',
    });

    const success: ApplicationResult<{ type: 'sample_completed' }> = Result.Ok({
      type: 'sample_completed',
    });
    const failure: ApplicationResult<{ type: 'sample_completed' }> =
      Result.Error(appError);

    expect(
      success.match({
        Ok: (outcome) => outcome,
        Error: () => undefined,
      })
    ).toEqual({ type: 'sample_completed' });
    expect(
      failure.match({
        Ok: () => undefined,
        Error: (error) => error,
      })
    ).toBe(appError);
  });
});
