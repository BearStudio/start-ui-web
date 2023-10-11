import { redirect } from 'next/navigation';

import { ADMIN_PATH } from '@/features/admin/constants';

export default function Page() {
  redirect(`${ADMIN_PATH}/docs/api`);
}
