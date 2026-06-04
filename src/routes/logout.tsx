import { createFileRoute } from '@tanstack/react-router';
import { createServerOnlyFn } from '@tanstack/react-start';

import { RouteError } from '@/platform/components/errors/route-error';

import { PageLogout } from '@/modules/auth/presentation';

const loadHandleLogoutRequest = createServerOnlyFn(async () => {
  const { handleLogoutRequest } = await import('@/modules/auth/backend');
  return handleLogoutRequest;
});

export const handleLogoutGetRequest = () =>
  new Response('Method Not Allowed', {
    headers: {
      Allow: 'POST',
    },
    status: 405,
  });

export const handleLogoutPostRequest = async (request: Request) => {
  const handleLogoutRequest = await loadHandleLogoutRequest();
  const authResponse = await handleLogoutRequest(request);

  if (!authResponse.ok) {
    return authResponse;
  }

  return new Response(null, {
    headers: authResponse.headers,
    status: 204,
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
  errorComponent: ({ error }) => <RouteError error={error} routeId="/logout" />,
});

function RouteComponent() {
  return <PageLogout />;
}
