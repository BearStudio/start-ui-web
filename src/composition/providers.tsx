import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import '@/platform/lib/dayjs/config';
import '@/platform/lib/i18n';
import '@fontsource-variable/inter';

import { QueryClientProvider } from '@/platform/lib/tanstack-query/provider';

import { Sonner } from '@/platform/components/ui/sonner';

import { queryClient } from '@/composition/client-query';
import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/modules/demo/presentation';
import { envClient } from '@/platform/env/client';

export const Providers = (props: {
  children: ReactNode;
  forcedTheme?: string;
}) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
      forcedTheme={props.forcedTheme}
    >
      <QueryClientProvider client={queryClient}>
        {props.children}
        {!isDemoModeDrawerVisible && <Sonner />}
        {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
