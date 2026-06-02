import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from '@sentry/tanstackstart-react';
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start';

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

let browserMutationGuardLogger: Pick<Logger, 'warn'> | undefined;
let browserMutationGuardLoggerPromise:
  | Promise<Pick<Logger, 'warn'>>
  | undefined;

type RequestContextWithCspNonce = {
  cspNonce?: unknown;
};

const getCspNonceFromContext = (context: unknown) => {
  if (typeof context !== 'object' || context === null) return undefined;

  const { cspNonce } = context as RequestContextWithCspNonce;
  return typeof cspNonce === 'string' ? cspNonce : undefined;
};

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

export const securityHeadersMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next }) => {
  const cspNonce = createCspNonce();
  const context = { cspNonce };
  const result = await next({ context });
  const response = applyAppSecurityHeaders(
    await replaceCspNoncePlaceholderInHtmlResponse(result.response, cspNonce),
    context
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

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
  referer: true,
  secFetchSite: 'same-origin',
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    sentryGlobalRequestMiddleware,
    securityHeadersMiddleware,
    browserMutationGuardMiddleware,
    csrfMiddleware,
  ],
  functionMiddleware: [sentryGlobalFunctionMiddleware],
}));

export {
  shouldProtectBrowserMutation,
  validateSameOriginBrowserMutationRequest,
};
