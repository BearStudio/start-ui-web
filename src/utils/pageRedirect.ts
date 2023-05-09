import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export const pageRedirect = (path: string) => () => {
  const router = useRouter();

  useEffect(() => {
    router.replace(path);
  }, [router]);

  return null;
};
