import { CircleAlertIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * What the body of a table shows while its first rows load, in its `empty` slot: a few fading skeleton lines, the
 * header staying in place.
 */
export const DataTableLoadingState = ({ rows = 3 }: { rows?: number }) => {
  const { t } = useTranslation(['components']);
  return (
    <div className="flex flex-col">
      {/* Said by the table's own live region, already in place: one mounted with its text is often not read. */}
      <span className="sr-only">
        {t('components:dataTable.states.loading')}
      </span>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          aria-hidden
          className="flex flex-col gap-2 py-2 opacity-(--opacity)"
          style={{ '--opacity': 1 - row / (rows * 2) } as React.CSSProperties}
        >
          <Skeleton className="h-2 w-1/3" />
          <Skeleton className="h-2 w-1/5" />
        </div>
      ))}
    </div>
  );
};

/**
 * What the body of a table shows when it has no row, in its `empty` slot. With `searchTerm` or `filtered`, it says
 * nothing matches, and `onReset` offers to clear the search and the filters (`table.reset`).
 */
export const DataTableEmptyState = ({
  children,
  searchTerm,
  filtered = false,
  onReset,
}: {
  children?: ReactNode;
  searchTerm?: string;
  filtered?: boolean;
  onReset?: () => void;
}) => {
  const { t } = useTranslation(['components']);
  const narrowed = filtered || !!searchTerm;
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-4 text-center text-sm text-muted-foreground">
      <div data-slot="data-table-state-message">
        {narrowed
          ? searchTerm
            ? t('components:dataTable.states.noResultsFor', { searchTerm })
            : t('components:dataTable.states.noResults')
          : (children ?? t('components:dataTable.states.empty'))}
      </div>
      {narrowed && !!onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <XIcon />
          {t('components:dataTable.states.clearFilters')}
        </Button>
      )}
    </div>
  );
};

/**
 * What the body of a table shows when its rows could not load, in its `empty` slot. `retry` asks again
 * (`query.refetch`); pass `retrying` while it does, and `failure` (`query.errorUpdatedAt`) so a retry that fails again
 * is read aloud again. The retry button stays in place meanwhile, and keeps the focus.
 */
export const DataTableErrorState = ({
  title,
  children,
  retry,
  retrying = false,
  failure,
}: {
  title?: ReactNode;
  children?: ReactNode;
  retry?: () => void;
  retrying?: boolean;
  /** Changes with each failure: the alert is read again, the rest stays as it is. */
  failure?: React.Key;
}) => {
  const { t } = useTranslation(['components']);
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      {/* Mounted anew for each failure, alone: an alert is read when it appears. */}
      <div
        key={failure}
        role="alert"
        className="flex w-full flex-col items-center gap-1"
      >
        <div className="flex w-full items-center justify-center gap-2 text-sm font-medium">
          <CircleAlertIcon className="size-4 text-muted-foreground" />
          {title ?? t('components:dataTable.states.error')}
        </div>
        {!!children && (
          <div className="text-sm text-muted-foreground">{children}</div>
        )}
      </div>
      {!!retry && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={retry}
          loading={retrying}
          // Busy, it keeps the focus it had.
          focusableWhenDisabled
        >
          <RefreshCwIcon />
          {t('components:dataTable.states.retry')}
        </Button>
      )}
    </div>
  );
};

/**
 * The footer of a table that loads its rows in batches (`useInfiniteQuery`): how many are loaded out of how many,
 * announced to screen readers, and the button that loads the next batch while there is one.
 */
export const DataTableLoadMore = ({
  loaded,
  total,
  hasMore,
  loading = false,
  onLoadMore,
}: {
  loaded: number;
  total?: number;
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
}) => {
  const { t } = useTranslation(['components']);
  const status = React.useRef<HTMLSpanElement>(null);
  // The last batch takes the button away: the focus it had goes to the count rather than to the page.
  const button = React.useCallback(
    (node: HTMLButtonElement | null) => () => {
      if (node !== null && document.activeElement === node)
        queueMicrotask(() => status.current?.focus());
    },
    []
  );
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        ref={status}
        role="status"
        tabIndex={-1}
        className="rounded-sm text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* Read when the last batch takes the button away and the focus comes here: it always says something. */}
        {total === undefined
          ? t('components:dataTable.states.loaded', { count: loaded })
          : t('components:dataTable.states.loadedOf', { loaded, total })}
      </span>
      {hasMore && (
        <Button
          ref={button}
          variant="secondary"
          size="sm"
          loading={loading}
          focusableWhenDisabled
          onClick={onLoadMore}
        >
          {t('components:dataTable.states.loadMore')}
        </Button>
      )}
    </div>
  );
};
