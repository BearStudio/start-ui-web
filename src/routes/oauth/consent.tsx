import { createFileRoute } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';
import { LayoutLogin } from '@/features/auth/layout-login';
import { getSignedOAuthQuery } from '@/features/auth/oauth';
import PageOAuthConsent from '@/features/auth/page-oauth-consent';

/**
 * Consent page of the OAuth provider (MCP clients), see `consentPage` in
 * src/server/auth.tsx
 */
export const Route = createFileRoute('/oauth/consent')({
  component: RouteComponent,
  errorComponent: () => <PageError type="error-boundary" />,
});

const noopSubscribe = () => () => {};

function RouteComponent() {
  // The signature covers the exact query string, so read it from the browser:
  // the router search state re-serializes repeated params (`ba_param`)
  const oauthQuery = useSyncExternalStore(
    noopSubscribe,
    () => getSignedOAuthQuery(window.location.search) ?? '',
    () => null
  );

  return (
    <GuardAuthenticated>
      <LayoutLogin>
        {oauthQuery === null && <Spinner full />}
        {oauthQuery === '' && <PageError type="404" />}
        {!!oauthQuery && <PageOAuthConsent oauthQuery={oauthQuery} />}
      </LayoutLogin>
    </GuardAuthenticated>
  );
}
