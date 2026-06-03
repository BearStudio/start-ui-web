import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

type MockEnvClient = {
  VITE_ENV_EMOJI?: string;
  VITE_ENV_NAME?: string;
  VITE_VISUAL_TEST: boolean;
};

const mockDevtoolsEnv = ({
  envClient,
  isDev,
}: {
  envClient: MockEnvClient;
  isDev: boolean;
}) => {
  vi.doMock('@/platform/env/client', () => ({ envClient }));
  vi.doMock('@/platform/env/config', () => ({
    envClient,
    isDevEnvironment: () => isDev,
  }));
};

describe('TanStackDevtoolsPanel', () => {
  afterEach(() => {
    vi.doUnmock('@/platform/env/client');
    vi.doUnmock('@/platform/env/config');
    vi.resetModules();
  });

  it('does not render devtools outside development', async () => {
    mockDevtoolsEnv({ envClient: { VITE_VISUAL_TEST: false }, isDev: false });
    const { shouldRenderTanStackDevtools } =
      await import('@/app/devtools/presentation/tanstack-devtools-visibility');
    const { TanStackDevtoolsPanel } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });

  it('enables dynamic devtools rendering in development', async () => {
    mockDevtoolsEnv({
      envClient: { VITE_ENV_NAME: 'LOCAL', VITE_VISUAL_TEST: false },
      isDev: true,
    });
    const { shouldRenderTanStackDevtools } =
      await import('@/app/devtools/presentation/tanstack-devtools-visibility');

    expect(shouldRenderTanStackDevtools()).toBe(true);
  });

  it('does not render devtools during E2E test runtime', async () => {
    mockDevtoolsEnv({
      envClient: { VITE_ENV_NAME: 'tests', VITE_VISUAL_TEST: false },
      isDev: true,
    });
    const { shouldRenderTanStackDevtools } =
      await import('@/app/devtools/presentation/tanstack-devtools-visibility');
    const { TanStackDevtoolsPanel } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });

  it('does not render devtools during visual testing', async () => {
    mockDevtoolsEnv({ envClient: { VITE_VISUAL_TEST: true }, isDev: true });
    const { shouldRenderTanStackDevtools } =
      await import('@/app/devtools/presentation/tanstack-devtools-visibility');
    const { TanStackDevtoolsPanel } =
      await import('@/app/devtools/presentation/tanstack-devtools');

    expect(shouldRenderTanStackDevtools()).toBe(false);
    expect(renderToStaticMarkup(<TanStackDevtoolsPanel />)).toBe('');
  });

  it('composes environment title prefixes without duplicate spaces', async () => {
    mockDevtoolsEnv({
      envClient: { VITE_ENV_NAME: 'LOCAL', VITE_VISUAL_TEST: false },
      isDev: true,
    });
    const { getEnvHintTitlePrefix } =
      await import('@/app/devtools/presentation/env-title-prefix');
    const { getPageTitle } = await import('@/platform/lib/get-page-title');

    expect(getEnvHintTitlePrefix()).toBe('[LOCAL]');
    expect(getPageTitle(undefined, getEnvHintTitlePrefix())).toBe(
      '[LOCAL] Start UI'
    );
  });
});
