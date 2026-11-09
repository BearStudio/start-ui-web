import { describe, expect, it } from 'vitest';

import { getSignedOAuthQuery, isOAuthFlowSearch } from '@/features/auth/oauth';

const signedSearch =
  '?client_id=abc&scope=openid+mcp%3Aread&ba_param=client_id&ba_param=scope&exp=1&sig=s%2Fig%3D';

describe('getSignedOAuthQuery', () => {
  it('returns the query untouched when it is signed', () => {
    const query = getSignedOAuthQuery(signedSearch);
    const params = new URLSearchParams(query);

    expect(params.get('sig')).toBe('s/ig=');
    expect(params.get('scope')).toBe('openid mcp:read');
    // Repeated params must be kept, they are part of the signature
    expect(params.getAll('ba_param')).toEqual(['client_id', 'scope']);
  });

  it('returns undefined when the query is not signed', () => {
    expect(getSignedOAuthQuery('?redirect=%2Fmanager')).toBeUndefined();
    expect(getSignedOAuthQuery('')).toBeUndefined();
  });
});

describe('isOAuthFlowSearch', () => {
  it('detects the signed query on the login page', () => {
    expect(isOAuthFlowSearch({ client_id: 'abc', sig: 'xyz' })).toBe(true);
  });

  it('detects the forwarded query on the verify page', () => {
    expect(
      isOAuthFlowSearch({ email: 'a@b.c', oauthQuery: 'client_id=abc&sig=x' })
    ).toBe(true);
  });

  it('ignores regular login searches', () => {
    expect(isOAuthFlowSearch({ redirect: '/manager' })).toBe(false);
    expect(isOAuthFlowSearch({ email: 'a@b.c', oauthQuery: '' })).toBe(false);
  });
});
