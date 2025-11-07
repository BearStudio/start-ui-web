import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { PageBookNew } from '@/features/book/manager/page-book-new';
import { zBook } from '@/features/book/schema';

export const Route = createFileRoute('/manager/books/new/')({
  component: RouteComponent,
  validateSearch: zodValidator(zBook().pick({ title: true }).partial()),
  search: {
    middlewares: [stripSearchParams({ title: '' })],
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageBookNew search={search} />;
}
