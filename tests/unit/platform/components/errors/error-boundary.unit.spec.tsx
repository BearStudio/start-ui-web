import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const boundaryMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  loggerError: vi.fn(),
  onError: undefined as
    | ((error: Error, info: { componentStack?: string | null }) => void)
    | undefined,
}));

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: (props: {
    children?: ReactNode;
    onError?: (error: Error, info: { componentStack?: string | null }) => void;
  }) => {
    boundaryMocks.onError = props.onError;
    return props.children ?? null;
  },
}));

vi.mock('@/platform/telemetry', () => ({
  getTelemetry: () => ({
    captureException: boundaryMocks.captureException,
  }),
}));

vi.mock('@/platform/telemetry/frontend-logger', () => ({
  frontendLogger: {
    error: boundaryMocks.loggerError,
  },
}));

vi.mock('@/platform/hooks/use-clipboard', () => ({
  useClipboard: () => ({
    copyToClipboard: vi.fn(),
    isCopied: false,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ErrorBoundary } from '@/platform/components/errors/error-boundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boundaryMocks.onError = undefined;
  });

  it('captures feature boundary errors once and preserves caller onError', () => {
    const callerOnError = vi.fn();
    const error = new Error('feature failed');

    renderToStaticMarkup(
      createElement(
        ErrorBoundary,
        { onError: callerOnError },
        createElement('div')
      )
    );

    expect(boundaryMocks.onError).toEqual(expect.any(Function));
    boundaryMocks.onError?.(error, { componentStack: 'Component stack' });

    expect(boundaryMocks.captureException).toHaveBeenCalledWith(error, {
      extra: { componentStack: 'Component stack' },
      level: 'error',
      tags: { event: 'feature.error_boundary' },
    });
    expect(boundaryMocks.loggerError).toHaveBeenCalledWith(
      'feature.error_boundary',
      {
        details: { componentStack: 'Component stack' },
        error,
        message: 'feature failed',
      }
    );
    expect(callerOnError).toHaveBeenCalledWith(error, {
      componentStack: 'Component stack',
    });
  });
});
