import {
  makeShortTestSecret,
  makeStrongTestSecret,
  makeTestSecret,
} from '@tests/support/test-secrets';
import { describe, expect, it } from 'vitest';

describe('test secret helpers', () => {
  it('normalizes labels and appends base64url random data', () => {
    expect(makeTestSecret(' Feature ++ Branch ', 1)).toMatch(
      /^feature-branch-[A-Za-z0-9_-]{2}$/
    );
  });

  it('omits empty normalized labels without dropping random data', () => {
    expect(makeTestSecret('!!!', 1)).toMatch(/^[A-Za-z0-9_-]{2}$/);
  });

  it('uses distinct random lengths for short and strong secrets', () => {
    expect(makeShortTestSecret('api')).toMatch(/^api-[A-Za-z0-9_-]{6}$/);
    expect(makeStrongTestSecret('api')).toMatch(/^api-[A-Za-z0-9_-]{32}$/);
  });
});
