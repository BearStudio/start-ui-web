import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('TanStackDevtoolsPanel', () => {
  afterEach(() => {
    vi.doUnmock('@/platform/env/config');
    vi.resetModules();
  });

  it('does not render devtools outside development', async () => {
    vi.doMock('@/platform/env/config', () => ({
      isDevEnvironment: () => false,
    }));
    const { shouldRenderTanStackDevtools, TanStackDevtoolsPanel } =
      await import('./tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });

  it('enables dynamic devtools rendering in development', async () => {
    vi.doMock('@/platform/env/config', () => ({
      isDevEnvironment: () => true,
    }));
    const { shouldRenderTanStackDevtools } =
      await import('./tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(true);
  });
});
