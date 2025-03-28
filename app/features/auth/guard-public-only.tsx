import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { authClient } from '@/lib/auth/client';

import { Spinner } from '@/components/ui/spinner';
import { LayoutLogin } from '@/features/auth/layout-login';

export const GuardPublicOnly = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession();
  const router = useRouter();

  if (session.isPending) {
    return (
      <LayoutLogin>
        <Spinner full className="opacity-60" />
      </LayoutLogin>
    );
  }

  if (session.error && session.error.status > 0) {
    return (
      <div>
        <p>Something wrong happened (public guard)</p>
        <p>{session.error.message}</p>
        <pre>{JSON.stringify(session.error, null, 2)}</pre>
      </div>
    ); // TODO
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
