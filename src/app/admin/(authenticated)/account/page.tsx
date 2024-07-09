import { redirect } from 'next/navigation';

import { ROUTES_ACCOUNT } from '@/features/account/routes';

export default function Page() {
  redirect(ROUTES_ACCOUNT.admin.profile());
}
