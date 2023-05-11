import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export const useSearchParamsUpdater = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    name: string,
    value: string | number | null,
    options?: { replace?: boolean }
  ) => {
    const current = new URLSearchParams(searchParams?.toString() ?? undefined);
    if (value === null) {
      current.delete(name);
    } else {
      current.set(name, value.toString());
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router[options?.replace ? 'replace' : 'push'](`${pathname}${query}`);
  };
};
