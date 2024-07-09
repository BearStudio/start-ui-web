import { redirect } from 'next/navigation';

import { ROUTES_USERS } from '@/features/users/routes';

export default function Page() {
  redirect(ROUTES_USERS.admin.root());
}
