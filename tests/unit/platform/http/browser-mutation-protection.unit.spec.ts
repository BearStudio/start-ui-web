import { describe, expect, it } from 'vitest';

import {
  appendBrowserMutationVaryHeader,
  shouldProtectBrowserMutation,
  validateSameOriginBrowserMutationRequest,
} from '@/platform/http/browser-mutation-protection';

const makeRequest = (headers?: HeadersInit) =>
  new Request('https://app.example/api/upload', {
    headers,
    method: 'POST',
  });

describe('browser mutation protection', () => {
  it('protects only configured router mutations', () => {
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/upload',
      })
    ).toBe(true);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'GET',
        pathname: '/api/upload',
      })
    ).toBe(false);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/auth/sign-in/email-otp',
      })
    ).toBe(false);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'serverFn',
        method: 'POST',
        pathname: '/api/upload',
      })
    ).toBe(false);
  });

  it('accepts any same-origin browser signal when no conflicting signal is present', () => {
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ 'Sec-Fetch-Site': 'same-origin' })
      )
    ).toEqual({ ok: true });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ Origin: 'https://app.example' })
      )
    ).toEqual({ ok: true });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ Referer: 'https://app.example/manager/books/new' })
      )
    ).toEqual({ ok: true });
  });

  it('rejects requests with no browser origin signal', () => {
    expect(validateSameOriginBrowserMutationRequest(makeRequest())).toEqual({
      ok: false,
      reason: 'missing_browser_origin_signal',
    });
  });

  it('rejects malformed request URLs without throwing', () => {
    const request = {
      headers: new Headers({ Origin: 'https://app.example' }),
      url: '/api/upload',
    } as Request;

    expect(validateSameOriginBrowserMutationRequest(request)).toEqual({
      ok: false,
      reason: 'origin_malformed',
    });
  });

  it('rejects same-site, cross-site, none, and malformed Fetch Metadata values', () => {
    for (const value of ['same-site', 'cross-site', 'none']) {
      expect(
        validateSameOriginBrowserMutationRequest(
          makeRequest({ 'Sec-Fetch-Site': value })
        )
      ).toEqual({
        ok: false,
        reason: 'sec_fetch_site_not_same_origin',
      });
    }

    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ 'Sec-Fetch-Site': 'same-origin, cross-site' })
      )
    ).toEqual({
      ok: false,
      reason: 'sec_fetch_site_malformed',
    });
  });

  it('rejects null, malformed, cross-origin, and inconsistent Origin values', () => {
    expect(
      validateSameOriginBrowserMutationRequest(makeRequest({ Origin: 'null' }))
    ).toEqual({ ok: false, reason: 'origin_null' });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ Origin: 'https://app.example/path' })
      )
    ).toEqual({ ok: false, reason: 'origin_malformed' });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ Origin: 'https://evil.example' })
      )
    ).toEqual({ ok: false, reason: 'origin_cross_origin' });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({
          Origin: 'https://evil.example',
          'Sec-Fetch-Site': 'same-origin',
        })
      )
    ).toEqual({ ok: false, reason: 'origin_cross_origin' });
  });

  it('rejects null, malformed, cross-origin, and inconsistent Referer values', () => {
    expect(
      validateSameOriginBrowserMutationRequest(makeRequest({ Referer: 'null' }))
    ).toEqual({ ok: false, reason: 'referer_null' });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ Referer: 'not a url' })
      )
    ).toEqual({ ok: false, reason: 'referer_malformed' });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({ Referer: 'https://evil.example/attack' })
      )
    ).toEqual({ ok: false, reason: 'referer_cross_origin' });
    expect(
      validateSameOriginBrowserMutationRequest(
        makeRequest({
          Referer: 'https://evil.example/attack',
          'Sec-Fetch-Site': 'same-origin',
        })
      )
    ).toEqual({ ok: false, reason: 'referer_cross_origin' });
  });

  it('appends Vary values used by the protection decision', () => {
    const response = new Response('ok', {
      headers: { Vary: 'Cookie' },
    });

    appendBrowserMutationVaryHeader(response);

    expect(response.headers.get('Vary')).toBe(
      'Cookie, Sec-Fetch-Site, Origin, Referer'
    );
  });
});
