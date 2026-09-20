import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  getSafeRedirect,
  isSafeRedirectPath,
  normalizeRedirectParam,
} from '@/features/auth/utils';

describe('isSafeRedirectPath', () => {
  it('accepts same-origin paths', () => {
    expect(isSafeRedirectPath('/')).toBe(true);
    expect(isSafeRedirectPath('/app')).toBe(true);
    expect(isSafeRedirectPath('/app?tab=1')).toBe(true);
  });

  it('rejects absolute, protocol-relative and backslash URLs', () => {
    expect(isSafeRedirectPath('https://evil.example/')).toBe(false);
    expect(isSafeRedirectPath('//evil.example/app')).toBe(false);
    expect(isSafeRedirectPath('/\\evil.example')).toBe(false);
    expect(isSafeRedirectPath('javascript:alert(1)')).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });
});

describe('getSafeRedirect', () => {
  it('returns safe paths and never throws on relative values', () => {
    expect(getSafeRedirect('/')).toBe('/');
    expect(getSafeRedirect('/app')).toBe('/app');
    expect(getSafeRedirect(undefined)).toBe('/');
  });

  it('preserves hash fragments', () => {
    expect(getSafeRedirect('/app#section')).toBe('/app#section');
  });

  it('falls back to / for external or malformed redirects', () => {
    expect(getSafeRedirect('https://evil.example/')).toBe('/');
    expect(getSafeRedirect('//evil.example/app')).toBe('/');
    expect(getSafeRedirect('/\\evil.example')).toBe('/');
  });
});

describe('normalizeRedirectParam', () => {
  it('strips same-origin absolute URLs to path', () => {
    expect(normalizeRedirectParam('http://localhost:3000/app')).toBe('/app');
  });

  it('preserves query and hash', () => {
    expect(normalizeRedirectParam('http://localhost:3000/app?a=1#s')).toBe(
      '/app?a=1#s'
    );
  });

  it('strips host from cross-origin URLs', () => {
    expect(normalizeRedirectParam('https://evil.example/phish')).toBe('/phish');
  });

  it('passes relative paths through', () => {
    expect(normalizeRedirectParam('/app')).toBe('/app');
  });

  it('leaves unsafe values untouched for the allowlist to reject', () => {
    expect(normalizeRedirectParam('javascript:alert(1)')).toBe(
      'javascript:alert(1)'
    );
    expect(normalizeRedirectParam('//evil.com/x')).toBe('//evil.com/x');
    expect(normalizeRedirectParam('/\\evil.example')).toBe('/\\evil.example');
  });

  it('composes with isSafeRedirectPath in validateSearch semantics', () => {
    const schema = z
      .string()
      .transform(normalizeRedirectParam)
      .refine(isSafeRedirectPath);
    expect(schema.safeParse('http://localhost:3000/app').success).toBe(true);
    const parsed = schema.safeParse('http://localhost:3000/app?a=1#s');
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toBe('/app?a=1#s');
    }
    expect(schema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(schema.safeParse('//evil.com/x').success).toBe(false);
  });
});

/**
 * Regression test for #774: the login route's `validateSearch` schema must
 * reject raw redirect values containing `://` (external URLs) *before*
 * `normalizeRedirectParam` converts them to same-origin paths.
 */
describe('login route schema rejects external redirects', () => {
  /** Mirrors the login route's `validateSearch` chain. */
  const loginRedirectSchema = z
    .string()
    .refine((v) => !v.includes('://'), 'External redirect URLs are not allowed')
    .transform(normalizeRedirectParam)
    .refine(isSafeRedirectPath);

  it('rejects external URLs with :// before normalization', () => {
    expect(
      loginRedirectSchema.safeParse('https://evil.example/phish').success
    ).toBe(false);
    expect(
      loginRedirectSchema.safeParse('http://evil.example/phish').success
    ).toBe(false);
    expect(
      loginRedirectSchema.safeParse('ftp://evil.example/file').success
    ).toBe(false);
  });

  it('rejects absolute URLs even if same-origin', () => {
    expect(
      loginRedirectSchema.safeParse('http://localhost:3000/app?tab=1#s').success
    ).toBe(false);
  });

  it('accepts relative paths', () => {
    expect(loginRedirectSchema.safeParse('/app').success).toBe(true);
    expect(loginRedirectSchema.safeParse('/').success).toBe(true);
  });
});
