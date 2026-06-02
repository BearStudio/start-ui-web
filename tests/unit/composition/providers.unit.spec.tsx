import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const themeProviderMock = vi.hoisted(() =>
  vi.fn((props: { children: ReactNode }) => props.children)
);

vi.mock('next-themes', () => ({
  ThemeProvider: themeProviderMock,
}));

vi.mock('@/platform/lib/tanstack-query/provider', () => ({
  QueryClientProvider: (props: { children: ReactNode }) => props.children,
}));

vi.mock('@/platform/components/ui/sonner', () => ({
  Sonner: () => null,
}));

vi.mock('@/app/demo/presentation', () => ({
  DemoModeDrawer: () => null,
  useIsDemoModeDrawerVisible: () => false,
}));

vi.mock('@/platform/env/client', () => ({
  envClient: {
    VITE_IS_DEMO: false,
  },
}));

describe('Providers', () => {
  it('passes the CSP nonce to the theme provider', async () => {
    const { Providers } = await import('@/composition/providers');

    renderToStaticMarkup(
      <Providers client={{} as QueryClient} cspNonce="theme-nonce">
        <span>child</span>
      </Providers>
    );

    expect(themeProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nonce: 'theme-nonce',
      }),
      undefined
    );
  });
});
