import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageRepositories } from '@/features/repository/manager/page-repositories';

export const Route = createFileRoute('/manager/_layout/repositories/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      searchTerm: z.string().default(''),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ searchTerm: '' })],
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageRepositories search={search} />;
}
