import { useNavigate, useRouter } from '@tanstack/react-router';

import type {
  DataTableStateValue,
  DataTableStore,
} from '@/components/ui/data-table/state';

/**
 * The TanStack Router adapter of a table: its state is the search of the current route, what its `validateSearch`
 * answered.
 */
export function useRouterDataTableStore<S extends DataTableStateValue>(
  search: S
): DataTableStore<S> {
  const router = useRouter();
  const navigate = useNavigate();
  // The router types a search by route; this store keeps the route it is on, whose search is `S`.
  const to = (next: (state: S) => S, replace?: boolean) =>
    ({
      to: '.',
      search: (current: S) => next(current),
      replace,
      resetScroll: false,
    }) as never;

  return {
    state: search,
    update: (next, options) => void navigate(to(next, options?.replace)),
    link: (next) => ({
      href: router.buildLocation(to(next)).href,
      onClick: (event) => {
        // A click with a modifier, or another button, opens the link where the browser says.
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        void navigate(to(next));
      },
    }),
  };
}
