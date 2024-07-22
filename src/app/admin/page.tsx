import { redirect } from 'next/navigation';

import { ROUTES_ADMIN_DASHBOARD } from '@/features/admin-dashboard/routes';

export default function Page() {
  redirect(ROUTES_ADMIN_DASHBOARD.admin.root());
}
