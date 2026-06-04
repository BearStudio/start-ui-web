import { useRouter } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PageError,
  PageErrorButtonBack,
  PageErrorButtonHome,
} from '@/platform/components/errors/page-error';
import { Button } from '@/platform/components/ui/button';

import { getTelemetry } from '@/platform/telemetry';
import { frontendLogger } from '@/platform/telemetry/frontend-logger';

import {
  type QueryErrorResetClient,
  retryRouteError,
} from './route-error-retry';

const hasResetQueries = (value: unknown): value is QueryErrorResetClient =>
  typeof value === 'object' &&
  value !== null &&
  'resetQueries' in value &&
  typeof value.resetQueries === 'function';

function getRouteQueryClient(
  context: unknown
): QueryErrorResetClient | undefined {
  if (
    typeof context !== 'object' ||
    context === null ||
    !('queryClient' in context)
  ) {
    return undefined;
  }

  const queryClient = context.queryClient;

  return hasResetQueries(queryClient) ? queryClient : undefined;
}

type RouteErrorProps = {
  error?: unknown;
  routeId?: string;
};

export const RouteError = ({ error, routeId }: RouteErrorProps) => {
  const router = useRouter();
  const queryClient = getRouteQueryClient(router.options.context);
  const [retrying, setRetrying] = useState(false);
  const { t } = useTranslation(['components']);

  useEffect(() => {
    if (error === undefined) return;

    const message = error instanceof Error ? error.message : 'Route error';
    const details = routeId ? { routeId } : undefined;
    getTelemetry().captureException(error, {
      extra: details,
      level: 'error',
      tags: {
        event: 'route.error_boundary',
        ...(routeId ? { routeId } : {}),
      },
    });
    frontendLogger.error('route.error_boundary', {
      error,
      message,
      ...(details ? { details } : {}),
    });
  }, [error, routeId]);

  const handleRetry = () => {
    setRetrying(true);
    const runRetry = async () => {
      try {
        await retryRouteError({ queryClient, router });
      } catch (error: unknown) {
        frontendLogger.error('route.error_retry_failed', {
          error,
          message:
            error instanceof Error ? error.message : 'Route error retry failed',
        });
      } finally {
        setRetrying(false);
      }
    };

    void runRetry();
  };

  return (
    <PageError type="error-boundary">
      <Button loading={retrying} onClick={handleRetry}>
        <RefreshCwIcon />
        {t('components:pageError.retry')}
      </Button>
      <PageErrorButtonBack />
      <PageErrorButtonHome />
    </PageError>
  );
};
