import type { QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { type ReactNode, useEffect } from 'react';
import '@/platform/lib/temporal/polyfill';
import '@/platform/lib/i18n';
import '@fontsource-variable/inter';

import { QueryClientProvider } from '@/platform/lib/tanstack-query/provider';

import { Sonner } from '@/platform/components/ui/sonner';

import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/app/demo/presentation';
import { getTelemetry } from '@/composition/telemetry';
import { useCurrentSessionQuery } from '@/modules/auth/client';
import { envClient } from '@/platform/env/client';
import { readCspNonceFromMeta } from '@/platform/http/csp-nonce';

export const Providers = (props: {
  children: ReactNode;
  client: QueryClient;
  cspNonce?: string;
  forcedTheme?: string;
}) => {
  const cspNonce = props.cspNonce ?? readCspNonceFromMeta();

  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
      nonce={cspNonce}
      forcedTheme={props.forcedTheme}
    >
      <QueryClientProvider client={props.client}>
        <ProviderContent>{props.children}</ProviderContent>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

function ProviderContent(props: { children: ReactNode }) {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();

  return (
    <>
      <TelemetryUserSync />
      {props.children}
      {!isDemoModeDrawerVisible && <Sonner />}
      {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
    </>
  );
}

function TelemetryUserSync() {
  const { data } = useCurrentSessionQuery();

  useEffect(() => {
    if (!data?.user) {
      getTelemetry().setUser(null);
      return;
    }

    getTelemetry().setUser({
      email: data.user.email,
      id: data.user.id,
      role: data.user.role,
    });
  }, [data?.user]);

  return null;
}
