import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { bookQueries } from '@/modules/book/client';
import { ManagerPageBooks as PageBooks } from '@/modules/book/presentation';
import { toScopeKey } from '@/modules/kernel';

export const Route = createFileRoute('/manager/books/')({
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
  loader: ({ context, deps }) => {
    if (isForbiddenRouteContext(context)) return undefined;

    return context.queryClient.ensureInfiniteQueryData(
      bookQueries.getAllInfinite({
        scopeKey: toScopeKey(context.scopeKey),
        searchTerm: deps.searchTerm,
      })
    );
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageBooks search={search} />;
}
