import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageAccount } from '@/features/account/manager/page-account';

export const Route = createFileRoute('/manager/_layout/account/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      state: z
        .enum(['', 'change-name', 'change-email-init', 'change-email-verify'])
        .default(''),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ state: '' })],
  },
});

function RouteComponent() {
  return <PageAccount />;
}
