import { createFileRoute } from '@tanstack/react-router';

import { PageBookNew } from '@/features/book/manager/page-book-new';

export const Route = createFileRoute('/manager/books/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBookNew />;
}
