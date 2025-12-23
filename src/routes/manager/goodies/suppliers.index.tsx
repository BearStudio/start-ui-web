import { createFileRoute } from '@tanstack/react-router';

import { PageGoodiesSuppliers } from '@/features/goodies/page-suppliers';

export const Route = createFileRoute('/manager/goodies/suppliers/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageGoodiesSuppliers />;
}
