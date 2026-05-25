import { createFileRoute } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import { PageOnboarding } from '@/modules/auth/presentation';

export const Route = createFileRoute('/onboarding/')({
  component: PageOnboarding,
  errorComponent: () => <PageError type="error-boundary" />,
});
