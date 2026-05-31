import { describe, expect, it } from 'vitest';

import { unwrapUseCaseResult } from '@/modules/kernel/transport/tanstack/result-mapper';
import { ServerFnError } from '@/modules/kernel/transport/tanstack/server-fn-error';
import { AppError } from '@/modules/kernel/domain/errors/app-error';

describe('tanstack result mapper', () => {
  it('unwraps successful use case results', async () => {
    await expect(
      unwrapUseCaseResult(Promise.resolve({ ok: true, value: 'value' }), {
        forbidden: 'FORBIDDEN',
      })
    ).resolves.toBe('value');
  });

  it('maps failure reasons and exposed app errors to server function errors', async () => {
    await expect(
      unwrapUseCaseResult(Promise.resolve({ ok: false, reason: 'forbidden' }), {
        forbidden: 'FORBIDDEN',
      })
    ).rejects.toBeInstanceOf(ServerFnError);

    await expect(
      unwrapUseCaseResult(
        Promise.reject(
          new AppError({
            code: 'DUPLICATE',
            category: 'conflict',
            status: 409,
            message: 'Duplicate',
            details: { target: ['email'] },
            exposeDetails: true,
          })
        ),
        { forbidden: 'FORBIDDEN' }
      )
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      data: { target: ['email'] },
    });
  });
});
