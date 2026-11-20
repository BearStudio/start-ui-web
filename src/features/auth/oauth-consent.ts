import { verifyOAuthQueryParams } from '@better-auth/oauth-provider';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';

import { auth } from '@/server/auth';

const getHttpsUrl = (value?: string | null) => {
  if (!value) return undefined;
  try {
    return new URL(value).protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
};

const getHost = (value?: string | null) => {
  if (!value) return undefined;
  try {
    return new URL(value).host;
  } catch {
    return undefined;
  }
};

/**
 * Data displayed on the OAuth consent page, read from the signed
 * authorization query so it cannot be tampered with.
 */
export const getOAuthConsent = createServerFn({ method: 'GET' })
  .validator(z.object({ oauthQuery: z.string() }))
  .handler(async ({ data }) => {
    const { secret } = await auth.$context;
    if (!(await verifyOAuthQueryParams(data.oauthQuery, secret))) {
      return { isValid: false } as const;
    }

    const query = new URLSearchParams(data.oauthQuery);
    const clientId = query.get('client_id');
    if (!clientId) return { isValid: false } as const;

    const client = await auth.api.getOAuthClientPublic({
      query: { client_id: clientId },
      headers: getRequestHeaders(),
    });

    // With CIMD, the client_id is the URL of the metadata document fetched by
    // the server: its host is the only verified identity of the client
    const clientIdHost = getHost(getHttpsUrl(clientId));

    return {
      isValid: true,
      client: {
        // Clients registered with CIMD or DCR choose their own name and logo,
        // so the client_id host and the redirect host are displayed to the user
        name:
          client.client_name ??
          clientIdHost ??
          getHost(client.client_uri) ??
          clientId,
        logoUrl: getHttpsUrl(client.logo_uri),
        host: clientIdHost,
      },
      redirectHost: getHost(query.get('redirect_uri')),
      scopes: (query.get('scope') ?? '').split(' ').filter(Boolean),
    } as const;
  });
