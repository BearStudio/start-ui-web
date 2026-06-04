import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';
import { describe, expect, it } from 'vitest';

import {
  internalRedirectFromLocation,
  isPostAuthDestinationUrl,
  normalizeInternalRedirect,
  parseSafeRedirectPath,
  resolvePostAuthDestination,
} from '@/modules/auth/presentation/redirects';

const urlTokenCharacters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '-',
  '_',
] as const;

const urlToken = (constraints: { maxLength: number; minLength: number }) =>
  fc
    .array(fc.constantFrom(...urlTokenCharacters), constraints)
    .map((characters) => characters.join(''));

const pathSegment = urlToken({ minLength: 1, maxLength: 12 });
const queryValue = urlToken({ minLength: 0, maxLength: 12 });

const safeInternalPath = fc
  .array(pathSegment, { minLength: 1, maxLength: 4 })
  .map((segments) => `/${segments.join('/')}`)
  .filter(
    (pathname) =>
      pathname !== '/login' &&
      pathname !== '/logout' &&
      !pathname.startsWith('/login/')
  );

const queryString = fc
  .array(fc.tuple(pathSegment, queryValue), { maxLength: 3 })
  .map((pairs) =>
    pairs.length > 0 ? `?${new URLSearchParams(pairs).toString()}` : ''
  );

const hashString = fc.option(
  queryValue.filter((value) => value.length > 0).map((value) => `#${value}`),
  { nil: '' }
);

const rejectedRedirect = fc.oneof(
  fc.webUrl({
    validSchemes: ['http', 'https'],
    withFragments: true,
    withQueryParameters: true,
  }),
  fc.domain().map((domain) => `//${domain}/app`),
  fc
    .array(pathSegment, { minLength: 1, maxLength: 3 })
    .map((segments) => segments.join('/'))
);

const authLoopRedirect = fc
  .tuple(
    fc.oneof(
      fc.constant('/login'),
      fc.constant('/logout'),
      fc
        .array(pathSegment, { maxLength: 3 })
        .map((segments) => `/login/${segments.join('/')}`)
    ),
    queryString,
    hashString
  )
  .map(([pathname, search, hash]) => `${pathname}${search}${hash}`);

describe('auth redirect helpers', () => {
  it('accepts only app-relative redirect targets', () => {
    expect(normalizeInternalRedirect('/app')).toBe('/app');
    expect(normalizeInternalRedirect('/manager/books?sort=title#top')).toBe(
      '/manager/books?sort=title#top'
    );

    expect(normalizeInternalRedirect('//evil.example')).toBeUndefined();
    expect(
      normalizeInternalRedirect('https://evil.example/app')
    ).toBeUndefined();
    expect(normalizeInternalRedirect('manager')).toBeUndefined();
    expect(normalizeInternalRedirect('')).toBeUndefined();
  });

  it('builds an internal redirect from router location parts', () => {
    expect(
      internalRedirectFromLocation({
        pathname: '/manager/books',
        searchStr: '?page=2',
        hash: 'details',
      })
    ).toBe('/manager/books?page=2#details');
  });

  it('routes authenticated users to their highest-permission app', () => {
    expect(resolvePostAuthDestination({ role: 'admin' })).toBe('/manager');
    expect(resolvePostAuthDestination({ role: 'user' })).toBe('/app');
    expect(resolvePostAuthDestination({ role: null })).toBe('/');
  });

  it('matches post-auth destinations and nested routes for E2E waits', () => {
    expect(isPostAuthDestinationUrl('http://localhost:3000/', '/')).toBe(true);
    expect(isPostAuthDestinationUrl('http://localhost:3000/app', '/')).toBe(
      false
    );
    expect(
      isPostAuthDestinationUrl('http://localhost:3000/manager', '/manager')
    ).toBe(true);
    expect(
      isPostAuthDestinationUrl(
        'http://localhost:3000/manager/dashboard',
        '/manager'
      )
    ).toBe(true);
    expect(
      isPostAuthDestinationUrl('http://localhost:3000/managerish', '/manager')
    ).toBe(false);
    expect(
      isPostAuthDestinationUrl(
        'http://localhost:3000/app/books?filter=mine',
        '/app'
      )
    ).toBe(true);
    expect(
      isPostAuthDestinationUrl('http://localhost:3000/login/verify', '/manager')
    ).toBe(false);
    expect(isPostAuthDestinationUrl('http://[::1', '/app')).toBe(false);
  });

  test.prop(
    { hash: hashString, pathname: safeInternalPath, search: queryString },
    PROPERTY_DEFAULTS
  )(
    'normalizes generated app-relative redirect targets',
    ({ hash, pathname, search }) => {
      const redirect = `${pathname}${search}${hash}`;
      const parsed = parseSafeRedirectPath(redirect);

      expect(normalizeInternalRedirect(redirect)).toBe(redirect);
      expect(parsed).toEqual({
        hash: hash ? hash.slice(1) : '',
        search: Object.fromEntries(new URLSearchParams(search)),
        to: pathname,
      });
    }
  );

  test.prop([rejectedRedirect], PROPERTY_DEFAULTS)(
    'rejects generated external and non-app-relative redirect targets',
    (redirect) => {
      expect(parseSafeRedirectPath(redirect)).toBeNull();
      expect(normalizeInternalRedirect(redirect)).toBeUndefined();
    }
  );

  test.prop([authLoopRedirect], PROPERTY_DEFAULTS)(
    'rejects generated auth-loop redirect targets',
    (redirect) => {
      expect(parseSafeRedirectPath(redirect)).toBeNull();
      expect(normalizeInternalRedirect(redirect)).toBeUndefined();
    }
  );
});
