import { redirect } from 'next/navigation';

import { ROUTES_APP } from '@/features/app/routes';

export default function Page() {
  redirect(ROUTES_APP.root());
}
