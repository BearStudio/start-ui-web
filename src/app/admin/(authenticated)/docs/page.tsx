import { redirect } from 'next/navigation';

import { ROUTES_DOCS } from '@/features/docs/routes';

export default function Page() {
  redirect(ROUTES_DOCS.admin.api());
}
