import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('TanStackDevtoolsPanel', () => {
  afterEach(() => {
    vi.doUnmock('@/platform/env/config');
    vi.resetModules();
  });

  it('does not render devtools outside development', async () => {
    vi.doMock('@/platform/env/config', () => ({
      envClient: { VITE_VISUAL_TEST: false },
      isDevEnvironment: () => false,
    }));
    const { shouldRenderTanStackDevtools, TanStackDevtoolsPanel } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });

  it('enables dynamic devtools rendering in development', async () => {
    vi.doMock('@/platform/env/config', () => ({
      envClient: { VITE_ENV_NAME: 'LOCAL', VITE_VISUAL_TEST: false },
      isDevEnvironment: () => true,
    }));
    const { shouldRenderTanStackDevtools } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(true);
  });

  it('does not render devtools during E2E test runtime', async () => {
    vi.doMock('@/platform/env/config', () => ({
      envClient: { VITE_ENV_NAME: 'tests', VITE_VISUAL_TEST: false },
      isDevEnvironment: () => true,
    }));
    const { shouldRenderTanStackDevtools, TanStackDevtoolsPanel } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });

  it('does not render devtools during visual testing', async () => {
    vi.doMock('@/platform/env/config', () => ({
      envClient: { VITE_VISUAL_TEST: true },
      isDevEnvironment: () => true,
    }));
    const { shouldRenderTanStackDevtools, TanStackDevtoolsPanel } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });
});
