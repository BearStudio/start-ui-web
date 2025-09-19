import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import '@/lib/dayjs/config';
import '@/lib/i18n';

import { QueryClientProvider } from '@/lib/tanstack-query/provider';

import { Sonner } from '@/components/ui/sonner';

import { envClient } from '@/env/client';
import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/features/demo/demo-mode-drawer';

export const Providers = (props: { children: ReactNode }) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
    >
      <QueryClientProvider>
        {props.children}
        {!isDemoModeDrawerVisible && <Sonner />}
        {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
