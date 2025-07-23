import type { ReactNode } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import '@/lib/dayjs/config';
import '@/lib/i18n';

import { QueryClientProvider } from '@/lib/tanstack-query/provider';

import { Sonner } from '@/components/ui/sonner';

import { envClient } from '@/env/client';
import {
  DemoModeDrawer, // !STARTERCONF [demoMode] Remove this import
  useIsDemoModeDrawerVisible, // !STARTERCONF [demoMode] Remove this import
} from '@/features/demo/demo-mode-drawer';

export const Providers = (props: { children: ReactNode }) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible(); // !STARTERCONF [demoMode] Remove this line
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
    >
      <QueryClientProvider>
        {props.children}
        {/* !STARTERCONF [demoMode] Remove the `!isDemoModeDrawerVisible` condition (keep the <Sonner /> component) */}
        {!isDemoModeDrawerVisible && <Sonner />}

        {/* !STARTERCONF [demoMode] Remove the <DemoModeDrawer /> */}
        {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
