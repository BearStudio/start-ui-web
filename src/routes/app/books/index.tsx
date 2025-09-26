import { createFileRoute } from '@tanstack/react-router';

import { PageBooks } from '@/features/book/app/page-books';

export const Route = createFileRoute('/app/books/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBooks />;
}
