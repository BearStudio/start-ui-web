import { createFileRoute } from '@tanstack/react-router';

import { RouteError } from '@/platform/components/errors/route-error';

import { PageOnboarding } from '@/modules/auth/presentation';

export const Route = createFileRoute('/onboarding/')({
  component: PageOnboarding,
  errorComponent: ({ error }) => (
    <RouteError error={error} routeId="/onboarding/" />
  ),
});
