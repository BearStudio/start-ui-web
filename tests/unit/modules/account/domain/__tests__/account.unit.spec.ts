import { describe, expect, it } from 'vitest';

import { normalizeAccountName } from '@/modules/account/domain/account';
import { isAccountNamePresent } from '@/modules/account/domain/account-policy';

describe('account domain', () => {
  it('normalizes and validates account names', () => {
    expect(normalizeAccountName(' Harold ')).toBe('Harold');
    expect(isAccountNamePresent(' Harold ')).toBe(true);
    expect(isAccountNamePresent(' ')).toBe(false);
  });
});
