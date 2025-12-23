import { createFileRoute } from '@tanstack/react-router';

import { PageGoodiesStock } from '@/features/goodies/page-stock-goodies';

export const Route = createFileRoute('/manager/goodies/stock/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageGoodiesStock />;
}
