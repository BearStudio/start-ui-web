import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useSearchParamsUpdater = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    params: Record<string, string | null>,
    options?: { replace?: boolean }
  ) => {
    const current = new URLSearchParams(searchParams?.toString() ?? undefined);

    Object.entries(params).forEach(([name, value]) => {
      if (value === null) {
        current.delete(name);
      } else {
        current.set(name, value.toString());
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router[options?.replace ? 'replace' : 'push'](`${pathname}${query}`);
  };
};
