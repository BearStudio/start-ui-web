import { appendVaryHeader } from './security-headers';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SEC_FETCH_SITE_VALUES = new Set([
  'same-origin',
  'same-site',
  'cross-site',
  'none',
]);
const DEFAULT_PROTECTED_BROWSER_MUTATION_PATHNAMES = ['/api/upload'] as const;

export const browserMutationVaryHeaders = [
  'Sec-Fetch-Site',
  'Origin',
  'Referer',
] as const;

export type BrowserMutationProtectionInput = {
  handlerType: 'serverFn' | 'router';
  method: string;
  pathname: string;
  protectedPathnames?: ReadonlySet<string> | readonly string[];
};

export type BrowserMutationRejectionReason =
  | 'missing_browser_origin_signal'
  | 'sec_fetch_site_malformed'
  | 'sec_fetch_site_not_same_origin'
  | 'origin_null'
  | 'origin_malformed'
  | 'origin_cross_origin'
  | 'referer_null'
  | 'referer_malformed'
  | 'referer_cross_origin';

export type BrowserMutationValidationResult =
  | { ok: true }
  | { ok: false; reason: BrowserMutationRejectionReason };

type BrowserMutationSignalValidationResult =
  | { ok: true; sameOrigin: boolean }
  | { ok: false; reason: BrowserMutationRejectionReason };

const toProtectedPathSet = (
  pathnames: BrowserMutationProtectionInput['protectedPathnames']
) =>
  pathnames instanceof Set
    ? pathnames
    : new Set(pathnames ?? DEFAULT_PROTECTED_BROWSER_MUTATION_PATHNAMES);

export function shouldProtectBrowserMutation({
  handlerType,
  method,
  pathname,
  protectedPathnames,
}: BrowserMutationProtectionInput) {
  return (
    handlerType === 'router' &&
    !SAFE_METHODS.has(method.toUpperCase()) &&
    toProtectedPathSet(protectedPathnames).has(pathname)
  );
}

const parseSerializedOrigin = (
  value: string,
  nullReason: BrowserMutationRejectionReason,
  malformedReason: BrowserMutationRejectionReason
):
  | { ok: true; origin: string }
  | { ok: false; reason: BrowserMutationRejectionReason } => {
  if (value === 'null') return { ok: false, reason: nullReason };

  try {
    const parsed = new URL(value);
    if (parsed.origin !== value) {
      return { ok: false, reason: malformedReason };
    }
    return { ok: true, origin: parsed.origin };
  } catch {
    return { ok: false, reason: malformedReason };
  }
};

const parseRefererOrigin = (
  value: string
):
  | { ok: true; origin: string }
  | { ok: false; reason: BrowserMutationRejectionReason } => {
  if (value === 'null') return { ok: false, reason: 'referer_null' };

  try {
    return { ok: true, origin: new URL(value).origin };
  } catch {
    return { ok: false, reason: 'referer_malformed' };
  }
};

const validateSecFetchSiteSignal = (
  value: string | null
): BrowserMutationSignalValidationResult => {
  if (value === null) return { ok: true, sameOrigin: false };
  if (!SEC_FETCH_SITE_VALUES.has(value)) {
    return { ok: false, reason: 'sec_fetch_site_malformed' };
  }
  if (value !== 'same-origin') {
    return { ok: false, reason: 'sec_fetch_site_not_same_origin' };
  }

  return { ok: true, sameOrigin: true };
};

const validateOriginSignal = (
  value: string | null,
  requestOrigin: string
): BrowserMutationSignalValidationResult => {
  if (value === null) return { ok: true, sameOrigin: false };

  const parsed = parseSerializedOrigin(
    value,
    'origin_null',
    'origin_malformed'
  );
  if (!parsed.ok) return parsed;
  if (parsed.origin !== requestOrigin) {
    return { ok: false, reason: 'origin_cross_origin' };
  }

  return { ok: true, sameOrigin: true };
};

const validateRefererSignal = (
  value: string | null,
  requestOrigin: string
): BrowserMutationSignalValidationResult => {
  if (value === null) return { ok: true, sameOrigin: false };

  const parsed = parseRefererOrigin(value);
  if (!parsed.ok) return parsed;
  if (parsed.origin !== requestOrigin) {
    return { ok: false, reason: 'referer_cross_origin' };
  }

  return { ok: true, sameOrigin: true };
};

export function validateSameOriginBrowserMutationRequest(
  request: Request
): BrowserMutationValidationResult {
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return { ok: false, reason: 'origin_malformed' };
  }

  let hasSameOriginSignal = false;
  const signalResults = [
    validateSecFetchSiteSignal(request.headers.get('Sec-Fetch-Site')),
    validateOriginSignal(request.headers.get('Origin'), requestOrigin),
    validateRefererSignal(request.headers.get('Referer'), requestOrigin),
  ];

  for (const result of signalResults) {
    if (!result.ok) return result;
    hasSameOriginSignal ||= result.sameOrigin;
  }

  return hasSameOriginSignal
    ? { ok: true }
    : { ok: false, reason: 'missing_browser_origin_signal' };
}

export function appendBrowserMutationVaryHeader(response: Response) {
  return appendVaryHeader(response, [...browserMutationVaryHeaders]);
}
