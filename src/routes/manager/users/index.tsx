import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { userQueries } from '@/modules/user/client';
import { PageUsers } from '@/modules/user/presentation';

export const Route = createFileRoute('/manager/users/')({
  validateSearch: zodValidator(
    z.object({
      searchTerm: z.string().prefault(''),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ searchTerm: '' })],
  },
  loaderDeps: ({ search: { searchTerm } }) => ({ searchTerm }),
  component: RouteComponent,
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData(
      userQueries.getAllInfinite({
        scopeKey: context.scopeKey,
        searchTerm: deps.searchTerm,
      })
    ),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageUsers search={search} />;
}
