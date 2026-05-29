import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from '@sentry/tanstackstart-react';
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start';

type StartHandlerType = 'serverFn' | 'router';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const ORIGIN_PROTECTED_SERVER_ROUTES = new Set(['/api/upload']);
const SECURITY_HEADERS = {
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    'upgrade-insecure-requests',
  ].join('; '),
  'Permissions-Policy': [
    'camera=()',
    'display-capture=()',
    'fullscreen=(self)',
    'geolocation=()',
    'microphone=()',
    'payment=()',
  ].join(', '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
} as const;

type OriginGuardInput = {
  handlerType: StartHandlerType;
  method: string;
  pathname: string;
};

export function shouldValidateOrigin({
  handlerType,
  method,
  pathname,
}: OriginGuardInput) {
  return (
    handlerType === 'router' &&
    !SAFE_METHODS.has(method.toUpperCase()) &&
    ORIGIN_PROTECTED_SERVER_ROUTES.has(pathname)
  );
}

export function hasSameOriginHeader(request: Request) {
  const origin = request.headers.get('origin');
  return origin !== null && origin === new URL(request.url).origin;
}

function applySecurityHeaders(response: Response) {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }

  if (import.meta.env.PROD) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

export const securityHeadersMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next }) => {
  const result = await next();
  applySecurityHeaders(result.response);
  return result;
});

export const originGuardMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ request, pathname, handlerType, next }) => {
  if (
    shouldValidateOrigin({ handlerType, method: request.method, pathname }) &&
    !hasSameOriginHeader(request)
  ) {
    console.warn('security.origin_rejected', {
      method: request.method,
      pathname,
    });

    return applySecurityHeaders(new Response('Forbidden', { status: 403 }));
  }

  return next();
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    sentryGlobalRequestMiddleware,
    securityHeadersMiddleware,
    originGuardMiddleware,
    csrfMiddleware,
  ],
  functionMiddleware: [sentryGlobalFunctionMiddleware],
}));
