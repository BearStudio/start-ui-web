import type { QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import '@/platform/lib/dayjs/config';
import '@/platform/lib/i18n';
import '@fontsource-variable/inter';

import { QueryClientProvider } from '@/platform/lib/tanstack-query/provider';

import { Sonner } from '@/platform/components/ui/sonner';

import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/app/demo/presentation';
import { envClient } from '@/platform/env/client';

export const Providers = (props: {
  children: ReactNode;
  client: QueryClient;
  cspNonce?: string;
  forcedTheme?: string;
}) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
      nonce={props.cspNonce}
      forcedTheme={props.forcedTheme}
    >
      <QueryClientProvider client={props.client}>
        {props.children}
        {!isDemoModeDrawerVisible && <Sonner />}
        {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
