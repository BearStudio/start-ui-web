import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from '@sentry/tanstackstart-react';
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start';

import { observeHttpRequest } from '@/composition/telemetry/request-observability';
import type { AuthSession } from '@/modules/auth';
import type { Logger } from '@/modules/kernel';
import { envClient } from '@/platform/env/client';
import {
  appendBrowserMutationVaryHeader,
  shouldProtectBrowserMutation,
  validateSameOriginBrowserMutationRequest,
} from '@/platform/http/browser-mutation-protection';
import { replaceCspNoncePlaceholderInHtmlResponse } from '@/platform/http/csp-nonce';
import { createCspNonce } from '@/platform/http/csp-nonce-server';
import { applySecurityHeaders } from '@/platform/http/security-headers';
import { createNoOpTelemetry } from '@/platform/telemetry';

export type AppStartRequestContext = {
  requestId: string;
  cspNonce?: string;
  auth?: {
    getSession: () => Promise<AuthSession | null>;
  };
};

declare module '@tanstack/react-router' {
  interface Register {
    server: {
      requestContext: AppStartRequestContext;
    };
  }
}

let browserMutationGuardLogger: Pick<Logger, 'warn'> | undefined;
let browserMutationGuardLoggerPromise:
  | Promise<Pick<Logger, 'warn'>>
  | undefined;

type RequestContextWithCspNonce = {
  cspNonce?: unknown;
};

type RequestContextWithRequestId = {
  requestId?: unknown;
};

const getCspNonceFromContext = (context: unknown) => {
  if (typeof context !== 'object' || context === null) return undefined;

  const { cspNonce } = context as RequestContextWithCspNonce;
  return typeof cspNonce === 'string' ? cspNonce : undefined;
};

const getRequestIdFromContext = (context: unknown) => {
  if (typeof context !== 'object' || context === null) return undefined;

  const { requestId } = context as RequestContextWithRequestId;
  return typeof requestId === 'string' ? requestId : undefined;
};

const mergeRequestContext = (
  context: unknown,
  overrides: Partial<AppStartRequestContext>
) => ({
  ...(typeof context === 'object' && context !== null ? context : {}),
  ...overrides,
});

const getSecurityHeaderOptions = (context?: unknown) => {
  const isTestRuntime = envClient.VITE_ENV_NAME === 'tests';

  return {
    allowDevServerCspRelaxations: isTestRuntime,
    allowPlaywrightScreenshotStyles: isTestRuntime,
    baseUrl: envClient.VITE_BASE_URL,
    cspNonce: getCspNonceFromContext(context),
    isProduction: import.meta.env.PROD,
    s3BucketPublicUrl: envClient.VITE_S3_BUCKET_PUBLIC_URL,
  };
};

const applyAppSecurityHeaders = (response: Response, context?: unknown) =>
  applySecurityHeaders(response, getSecurityHeaderOptions(context));

const getBrowserMutationGuardLogger = async () => {
  if (browserMutationGuardLogger) {
    return browserMutationGuardLogger;
  }

  if (!browserMutationGuardLoggerPromise) {
    browserMutationGuardLoggerPromise =
      import('@/modules/kernel/infrastructure/logger/pino')
        .then(({ createPinoAppLogger, createPinoLogger }) => {
          const logger = createPinoAppLogger({
            pino: createPinoLogger(),
            telemetry: createNoOpTelemetry(),
          });
          browserMutationGuardLogger = logger;

          return logger;
        })
        .catch((error: unknown) => {
          browserMutationGuardLoggerPromise = undefined;
          throw error;
        });
  }

  return browserMutationGuardLoggerPromise;
};

const createTrustedAuthSessionAccessor = (request: Request) => {
  let sessionPromise: Promise<AuthSession | null> | undefined;

  return () => {
    sessionPromise ??= import('@/composition/auth').then(
      async ({ getAuthUseCases }) => {
        const result = await getAuthUseCases().getCurrentSession({
          headers: request.headers,
        });

        if (result.isError()) throw result.getError();

        const outcome = result.get();
        return outcome.type === 'auth_session_found' ? outcome.session : null;
      }
    );

    return sessionPromise;
  };
};

export const authRequestContextMiddleware = createMiddleware({
  type: 'request',
}).server(({ context, request, next }) =>
  next({
    context: mergeRequestContext(context, {
      auth: {
        getSession: createTrustedAuthSessionAccessor(request),
      },
    }),
  })
);

export const securityHeadersMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ context, next }) => {
  const cspNonce = createCspNonce();
  const nextContext = mergeRequestContext(context, { cspNonce });
  const result = await next({ context: nextContext });
  const response = applyAppSecurityHeaders(
    await replaceCspNoncePlaceholderInHtmlResponse(result.response, cspNonce),
    nextContext
  );

  return {
    ...result,
    response,
  };
});

export const browserMutationGuardMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ context, request, pathname, handlerType, next }) => {
  if (
    !shouldProtectBrowserMutation({
      handlerType,
      method: request.method,
      pathname,
    })
  ) {
    return next();
  }

  const validation = validateSameOriginBrowserMutationRequest(request);
  if (!validation.ok) {
    try {
      const logger = await getBrowserMutationGuardLogger();
      logger.warn({
        details: {
          method: request.method,
          pathname,
          reason: validation.reason,
        },
        direction: 'inbound',
        event: 'security.browser_mutation_rejected',
      });
    } catch {
      // Keep enforcement deterministic even if logger initialization fails.
    }

    const response = appendBrowserMutationVaryHeader(
      new Response('Forbidden', { status: 403 })
    );
    return applyAppSecurityHeaders(response, context);
  }

  const result = await next();
  appendBrowserMutationVaryHeader(result.response);
  return result;
});

export const telemetryRequestMiddleware = createMiddleware({
  type: 'request',
}).server(({ context, request, pathname, handlerType, next }) =>
  observeHttpRequest(
    {
      handlerType,
      pathname,
      request,
      requestId: getRequestIdFromContext(context),
    },
    () => next()
  )
);

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
  referer: true,
  secFetchSite: 'same-origin',
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    sentryGlobalRequestMiddleware,
    telemetryRequestMiddleware,
    securityHeadersMiddleware,
    authRequestContextMiddleware,
    browserMutationGuardMiddleware,
    csrfMiddleware,
  ],
  functionMiddleware: [sentryGlobalFunctionMiddleware],
}));

export {
  shouldProtectBrowserMutation,
  validateSameOriginBrowserMutationRequest,
};
