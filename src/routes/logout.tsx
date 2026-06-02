import { createFileRoute } from '@tanstack/react-router';
import { createServerOnlyFn } from '@tanstack/react-start';

import { PageError } from '@/platform/components/errors/page-error';

import { PageLogout } from '@/modules/auth/presentation';

const signOutOnServer = createServerOnlyFn(async (request: Request) => {
  const { handleLogoutRequest } = await import('@/modules/auth/backend');
  return handleLogoutRequest(request);
});

export const handleLogoutGetRequest = () =>
  new Response('Method Not Allowed', {
    headers: {
      Allow: 'POST',
    },
    status: 405,
  });

export const handleLogoutPostRequest = async (request: Request) => {
  const authResponse = await signOutOnServer(request);
  const headers = new Headers(authResponse.headers);
  headers.set('Location', '/');

  return new Response(null, {
    headers,
    status: 303,
  });
};

export const Route = createFileRoute('/logout')({
  server: {
    handlers: {
      GET: () => handleLogoutGetRequest(),
      POST: ({ request }) => handleLogoutPostRequest(request),
    },
  },
  component: RouteComponent,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return <PageLogout />;
}
