import { redirect } from 'next/navigation';

import { APP_PATH } from '@/features/app/constants';

export default function Page() {
  redirect(APP_PATH || '/');
}
