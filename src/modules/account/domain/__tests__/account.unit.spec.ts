import { describe, expect, it } from 'vitest';

import { normalizeAccountName } from '../account';
import { isAccountNamePresent } from '../account-policy';

describe('account domain', () => {
  it('normalizes and validates account names', () => {
    expect(normalizeAccountName(' Harold ')).toBe('Harold');
    expect(isAccountNamePresent(' Harold ')).toBe(true);
    expect(isAccountNamePresent(' ')).toBe(false);
  });
});
