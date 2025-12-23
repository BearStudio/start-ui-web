import { createFileRoute } from '@tanstack/react-router';

import PageGoodieNew from '@/features/goodies/page-goodies-new';

export const Route = createFileRoute('/manager/goodies/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageGoodieNew />;
}
