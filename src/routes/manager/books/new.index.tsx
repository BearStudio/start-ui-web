import { createFileRoute } from '@tanstack/react-router';

import { PageBookNew } from '@/modules/book';

export const Route = createFileRoute('/manager/books/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBookNew />;
}
