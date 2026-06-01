import { Result } from '@swan-io/boxed';
import { describe, expect, it } from 'vitest';

import type { Database } from '@/modules/kernel/infrastructure/db/client';

import { normalizeCreateAuthInput } from '@/modules/auth/infrastructure/better-auth/create-auth-options';
import type { AuthEmailPort } from '@/modules/auth/testing';

const database = {
  select: () => undefined,
} as unknown as Database;

const authEmailPort = {
  sendSignInOtp: async () => Result.Ok({ type: 'auth_sign_in_otp_sent' }),
} satisfies AuthEmailPort;

describe('normalizeCreateAuthInput', () => {
  it('uses empty options for missing or null input', () => {
    expect(normalizeCreateAuthInput()).toEqual({});
    expect(normalizeCreateAuthInput(null)).toEqual({});
  });

  it('wraps database inputs as options', () => {
    expect(normalizeCreateAuthInput(database)).toEqual({ database });
  });

  it('preserves empty options objects', () => {
    const options = {};

    expect(normalizeCreateAuthInput(options)).toBe(options);
  });

  it('preserves explicit auth options', () => {
    const options = {
      database,
      authEmailPort,
    };

    expect(normalizeCreateAuthInput(options)).toBe(options);
  });
});
