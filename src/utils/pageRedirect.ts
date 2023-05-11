import { useEffect } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

export const pageRedirect =
  <T extends string>(path: Route<T>) =>
  () => {
    const router = useRouter();

    useEffect(() => {
      router.replace(path);
    }, [router]);

    return null;
  };
