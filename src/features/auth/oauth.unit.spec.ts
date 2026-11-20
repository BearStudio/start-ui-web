import { verifyOAuthQueryParams } from '@better-auth/oauth-provider';
import { makeSignature } from 'better-auth/crypto';
import { describe, expect, it } from 'vitest';

import {
  getSignedOAuthQuery,
  isInvalidOAuthQueryError,
  isOAuthFlowSearch,
} from '@/features/auth/oauth';

const SECRET = 'test-secret';

/** Sign a query the way Better Auth's OAuth provider does (`signParams`) */
const signQuery = async (entries: Record<string, string>) => {
  const params = new URLSearchParams(entries);
  for (const name of [...params.keys(), 'ba_param'].sort()) {
    params.append('ba_param', name);
  }
  // Canonical form: sorted by key then value. sort() is stable and the ba_param values are appended already sorted
  const canonical = new URLSearchParams(params);
  canonical.sort();
  params.set('sig', await makeSignature(canonical.toString(), SECRET));
  return params.toString();
};

const signedSearch =
  '?client_id=abc&scope=openid+mcp%3Aread&exp=1&ba_iat=1000&ba_param=ba_iat&ba_param=ba_param&ba_param=client_id&ba_param=exp&ba_param=scope&sig=s%2Fig%3D';

describe('getSignedOAuthQuery', () => {
  it('keeps every signed param', () => {
    const query = getSignedOAuthQuery(signedSearch);
    const params = new URLSearchParams(query);

    expect(params.get('sig')).toBe('s/ig=');
    expect(params.get('scope')).toBe('openid mcp:read');
    expect(params.get('exp')).toBe('1');
    expect(params.get('ba_iat')).toBe('1000');
    // Repeated params must be kept, they are part of the signature
    expect(params.getAll('ba_param')).toEqual([
      'ba_iat',
      'ba_param',
      'client_id',
      'exp',
      'scope',
    ]);
  });

  it('drops the params added after signing', () => {
    const query = getSignedOAuthQuery(
      `?utm_source=newsletter&${signedSearch.slice(1)}&redirect=%2Fmanager`
    );

    expect(query).toBe(getSignedOAuthQuery(signedSearch));
  });

  it('keeps the signature valid when params are added after signing', async () => {
    const signed = await signQuery({
      client_id: 'abc',
      scope: 'openid mcp:read',
      exp: String(Math.floor(Date.now() / 1000) + 600),
    });
    const search = `?utm_source=newsletter&${signed}&redirect=%2Fmanager`;

    // The extra params break the signature of the raw query
    expect(await verifyOAuthQueryParams(search, SECRET)).toBe(false);
    expect(
      await verifyOAuthQueryParams(getSignedOAuthQuery(search) ?? '', SECRET)
    ).toBe(true);
  });

  it('keeps a signed query without signed param names invalid', () => {
    // Rejected by Better Auth as `invalid_signature`, not ignored as a regular
    // login, so the user is asked to restart the flow
    expect(getSignedOAuthQuery('?client_id=abc&sig=forged')).toBe('sig=forged');
  });

  it('returns undefined when the query is not signed', () => {
    expect(getSignedOAuthQuery('?redirect=%2Fmanager')).toBeUndefined();
    expect(getSignedOAuthQuery('')).toBeUndefined();
  });
});

describe('isInvalidOAuthQueryError', () => {
  it('detects the expired signed query error of the auth client', () => {
    expect(
      isInvalidOAuthQueryError({
        error: 'invalid_signature',
        status: 400,
        statusText: 'BAD_REQUEST',
      })
    ).toBe(true);
  });

  it('ignores other errors', () => {
    expect(
      isInvalidOAuthQueryError({
        code: 'INVALID_OTP',
        message: 'Invalid OTP',
        status: 400,
      })
    ).toBe(false);
    expect(isInvalidOAuthQueryError(new Error('invalid_signature'))).toBe(
      false
    );
    expect(isInvalidOAuthQueryError(null)).toBe(false);
    expect(isInvalidOAuthQueryError(undefined)).toBe(false);
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
