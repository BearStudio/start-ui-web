import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { authClient } from '@/lib/auth/client';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession();
  const router = useRouter();

  if (session.error) {
    return <div>Something wrong happened</div>; // TODO
  }

  if (session.data?.user) {
    router.navigate({
      to: '/',
      replace: true,
    });
    return null;
  }

  return <>{children}</>;
};
