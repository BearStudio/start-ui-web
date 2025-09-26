import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageAccount } from '@/features/account/app/page-account';

export const Route = createFileRoute('/app/account/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      state: z.enum(['', 'change-name']).default(''),
      newEmail: z.string().default(''),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ state: '', newEmail: '' })],
  },
});

function RouteComponent() {
  return <PageAccount />;
}
