import { createFileRoute } from '@tanstack/react-router';

import { AppPageBooks as PageBooks } from '@/modules/book/presentation';

export const Route = createFileRoute('/app/books/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBooks />;
}
