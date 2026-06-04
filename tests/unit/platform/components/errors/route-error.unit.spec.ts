import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeErrorMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  retryClick: undefined as (() => void) | undefined,
  retryLoading: undefined as boolean | undefined,
  router: {
    invalidate: vi.fn(async () => undefined),
    options: {
      context: {} as unknown,
    },
  },
  loggerError: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (effect: () => void) => {
      effect();
    },
  };
});

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => routeErrorMocks.router,
}));

vi.mock('@/platform/components/errors/page-error', () => ({
  PageError: (props: { children?: ReactNode }) => props.children,
  PageErrorButtonBack: () => null,
  PageErrorButtonHome: () => null,
}));

vi.mock('@/platform/components/ui/button', () => ({
  Button: (props: {
    children?: ReactNode;
    loading?: boolean;
    onClick?: () => void;
  }) => {
    routeErrorMocks.retryClick = props.onClick;
    routeErrorMocks.retryLoading = props.loading;
    return null;
  },
}));

vi.mock('lucide-react', () => ({
  RefreshCwIcon: () => null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/platform/telemetry/frontend-logger', () => ({
  frontendLogger: {
    error: routeErrorMocks.loggerError,
  },
}));

vi.mock('@/platform/telemetry', () => ({
  getTelemetry: () => ({
    captureException: routeErrorMocks.captureException,
  }),
}));

import { RouteError } from '@/platform/components/errors/route-error';
import { retryRouteError } from '@/platform/components/errors/route-error-retry';

const renderAndClickRetry = () => {
  renderToStaticMarkup(createElement(RouteError));

  expect(routeErrorMocks.retryClick).toEqual(expect.any(Function));
  expect(routeErrorMocks.retryLoading).toBe(false);
  routeErrorMocks.retryClick?.();
};

beforeEach(() => {
  routeErrorMocks.retryClick = undefined;
  routeErrorMocks.retryLoading = undefined;
  routeErrorMocks.router.options.context = {};
  routeErrorMocks.router.invalidate = vi.fn(async () => undefined);
  routeErrorMocks.captureException.mockReset();
  routeErrorMocks.loggerError.mockReset();
});

describe('retryRouteError', () => {
  it('resets query error state before invalidating the current route match', async () => {
    const calls: string[] = [];
    const queryClient = {
      resetQueries: vi.fn(async (_filter?: unknown) => {
        calls.push('resetQueries');
      }),
    };
    const router = {
      invalidate: vi.fn(async () => {
        calls.push('invalidate');
      }),
    };

    await retryRouteError({ queryClient, router });

    expect(calls).toEqual(['resetQueries', 'invalidate']);
    expect(queryClient.resetQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });
    const resetFilter = queryClient.resetQueries.mock.calls[0]?.[0] as
      | { predicate: (query: { state: { status: string } }) => boolean }
      | undefined;
    expect(resetFilter?.predicate({ state: { status: 'error' } })).toBe(true);
    expect(resetFilter?.predicate({ state: { status: 'success' } })).toBe(
      false
    );
    expect(router.invalidate).toHaveBeenCalledOnce();
  });

  it('still invalidates the route match when no query client is available', async () => {
    const router = {
      invalidate: vi.fn(async () => undefined),
    };

    await retryRouteError({ router });

    expect(router.invalidate).toHaveBeenCalledOnce();
  });
});

describe('RouteError', () => {
  it('captures and logs route boundary errors with route context', () => {
    const error = new Error('route failed');

    renderToStaticMarkup(
      createElement(RouteError, { error, routeId: '/manager' })
    );

    expect(routeErrorMocks.captureException).toHaveBeenCalledWith(error, {
      extra: { routeId: '/manager' },
      level: 'error',
      tags: {
        event: 'route.error_boundary',
        routeId: '/manager',
      },
    });
    expect(routeErrorMocks.loggerError).toHaveBeenCalledWith(
      'route.error_boundary',
      {
        details: { routeId: '/manager' },
        error,
        message: 'route failed',
      }
    );
  });

  it('resets errored queries from a valid route query client before retrying the route', async () => {
    const calls: string[] = [];
    const queryClient = {
      resetQueries: vi.fn(async () => {
        calls.push('resetQueries');
      }),
    };
    routeErrorMocks.router.invalidate = vi.fn(async () => {
      calls.push('invalidate');
    });
    routeErrorMocks.router.options.context = { queryClient };

    renderAndClickRetry();

    await vi.waitFor(() =>
      expect(calls).toEqual(['resetQueries', 'invalidate'])
    );
    expect(queryClient.resetQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });
    expect(routeErrorMocks.loggerError).not.toHaveBeenCalled();
  });

  it.each([null, undefined, 'not-context', {}, { queryClient: {} }])(
    'retries the route when the route context has no resettable query client: %s',
    async (context) => {
      routeErrorMocks.router.options.context = context;

      renderAndClickRetry();

      await vi.waitFor(() =>
        expect(routeErrorMocks.router.invalidate).toHaveBeenCalledOnce()
      );
      expect(routeErrorMocks.loggerError).not.toHaveBeenCalled();
    }
  );

  it('logs retry failures without rethrowing from the click handler', async () => {
    const failure = new Error('retry failed');
    routeErrorMocks.router.invalidate = vi.fn(async () => {
      throw failure;
    });
    routeErrorMocks.router.options.context = {
      queryClient: {
        resetQueries: vi.fn(async () => undefined),
      },
    };

    expect(() => renderAndClickRetry()).not.toThrow();

    await vi.waitFor(() =>
      expect(routeErrorMocks.loggerError).toHaveBeenCalledWith(
        'route.error_retry_failed',
        expect.objectContaining({
          error: failure,
          message: 'retry failed',
        })
      )
    );
  });

  it('logs non-error retry failures with the fallback message', async () => {
    const failure = 'retry failed';
    routeErrorMocks.router.invalidate = vi.fn(async () => {
      throw failure;
    });

    expect(() => renderAndClickRetry()).not.toThrow();

    await vi.waitFor(() =>
      expect(routeErrorMocks.loggerError).toHaveBeenCalledWith(
        'route.error_retry_failed',
        expect.objectContaining({
          error: failure,
          message: 'Route error retry failed',
        })
      )
    );
  });
});
