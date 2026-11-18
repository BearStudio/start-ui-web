import { DirectionProvider } from '@base-ui/react/direction-provider';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';
import '@/lib/i18n';
import '@fontsource-variable/inter';

import { QueryClientProvider } from '@/lib/tanstack-query/provider';

import { Sonner } from '@/components/ui/sonner';

import { envClient } from '@/env/client';
import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/features/demo/demo-mode-drawer';

export const Providers = (props: {
  children: ReactNode;
  forcedTheme?: string;
}) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();
  const { i18n } = useTranslation();
  return (
    // Base UI reads the direction from this context, not from `dir`: scroll areas, menus and sliders follow it.
    <DirectionProvider direction={i18n.dir()}>
      <ThemeProvider
        attribute="class"
        storageKey="theme"
        disableTransitionOnChange
        forcedTheme={props.forcedTheme}
      >
        <QueryClientProvider>
          {props.children}
          {!isDemoModeDrawerVisible && <Sonner />}
          {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
        </QueryClientProvider>
      </ThemeProvider>
    </DirectionProvider>
  );
};
