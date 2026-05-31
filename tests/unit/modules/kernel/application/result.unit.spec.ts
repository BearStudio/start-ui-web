import { describe, expect, it } from 'vitest';

import { fail, ok } from '@/modules/kernel/application/result';

describe('use case result helpers', () => {
  it('creates success and failure result unions', () => {
    expect(ok('value')).toEqual({ ok: true, value: 'value' });
    expect(fail('forbidden')).toEqual({ ok: false, reason: 'forbidden' });
  });
});
