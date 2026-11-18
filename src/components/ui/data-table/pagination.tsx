import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { AnchorButton } from '@/components/ui/anchor-button';
import { Button } from '@/components/ui/button';
import type { DataTableLink } from '@/components/ui/data-table/state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** How many pages `total` rows fill: one at least, and one for a count that is not a number (an API that lacks it). */
export const pageCount = (total: number, pageSize: number) =>
  Number.isFinite(total) && total > 0 && pageSize > 0
    ? Math.ceil(total / pageSize)
    : 1;

/** The first page, the last, the current one and `siblings` on each side of it, with a gap where pages are left out. */
export const pagesAround = (
  page: number,
  pages: number,
  siblings = 1
): ReadonlyArray<number | 'gap-before' | 'gap-after'> => {
  const around = Array.from(
    { length: siblings * 2 + 1 },
    (_, i) => page - siblings + i
  );
  const shown = [...new Set([1, ...around, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  return shown.flatMap((n, i) => {
    const gap = i === 0 ? 0 : n - (shown[i - 1] ?? n) - 1;
    if (gap === 0) return [n];
    if (gap === 1) return [n - 1, n];
    return [n <= page ? ('gap-before' as const) : ('gap-after' as const), n];
  });
};

type PageControlProps = Omit<
  React.ComponentProps<typeof AnchorButton>,
  'href' | 'onClick' | 'ref'
> & {
  ref?: React.Ref<HTMLAnchorElement | HTMLButtonElement> | undefined;
  link: DataTableLink | undefined;
  onGo: () => void;
  onActivate: (event: React.MouseEvent) => void;
};

// A link where the table has addresses (the URL), a button where it has none (memory).
function PageControl({
  link,
  onGo,
  onActivate,
  disabled = false,
  ref,
  variant,
  size,
  className,
  children,
  ...props
}: PageControlProps) {
  if (link === undefined)
    return (
      <Button
        {...(props as React.ComponentProps<typeof Button>)}
        ref={ref as React.Ref<HTMLButtonElement>}
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        onClick={(event) => {
          onActivate(event);
          onGo();
        }}
      >
        {children}
      </Button>
    );
  return (
    <AnchorButton
      {...props}
      ref={ref as React.Ref<HTMLAnchorElement>}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      href={link.href}
      onClick={(event) => {
        onActivate(event);
        link.onClick(event);
      }}
    >
      {children}
    </AnchorButton>
  );
}

type PageNavigation = {
  readonly pageLink: (page: number) => DataTableLink | undefined;
  readonly goToPage: (
    page: number,
    options?: { readonly replace?: boolean }
  ) => void;
};

function PageSizeSelect({
  pageSize,
  pageSizes,
  onPageSizeChange,
}: {
  pageSize: number;
  pageSizes: ReadonlyArray<number>;
  onPageSizeChange: (size: number) => void;
}) {
  const { t } = useTranslation(['components']);
  const id = React.useId();
  // The size of the state stays offered, though the list lacks it: the select shows what the table shows.
  const sizes = pageSizes.includes(pageSize)
    ? pageSizes
    : [...pageSizes, pageSize].sort((a, b) => a - b);
  return (
    <div className="flex items-center gap-2">
      {/* Hidden from sight in a narrow footer: the select keeps it as its name. */}
      <span
        id={id}
        className="sr-only whitespace-nowrap text-muted-foreground @sm:not-sr-only"
      >
        {t('components:dataTable.rowsPerPage')}
      </span>
      <Select
        value={pageSize}
        onValueChange={(size) => {
          if (size !== null) onPageSizeChange(size);
        }}
      >
        <SelectTrigger size="sm" aria-labelledby={id} className="w-18">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type PaginationProps = {
  /** What `useDataTable` answers. */
  table: PageNavigation & {
    readonly page: number;
    readonly pageSize: number;
    readonly setPageSize?: (size: number) => void;
  };
  /** The page sizes offered in a "Rows per page" select: none, no select. */
  pageSizes?: ReadonlyArray<number>;
  /** How many rows match, announced with the page: "37 users". */
  results?: string;
  /**
   * True while the count is not the one of the rows asked for, as with `placeholderData`: a page past the last then
   * stays, since the count may grow.
   */
  busy?: boolean;
  'aria-label': string;
} & (
  | {
      /** How many rows match, on every page: the pages follow from it and `table.pageSize`. */
      total: number;
      pages?: never;
    }
  | {
      /** How many pages there are, for an API that counts them. */
      pages: number;
      total?: never;
    }
);

/**
 * The pages of a table, in the footer of `DataTable`: links when its store has addresses, buttons otherwise. A page
 * past the last, from an old link or once its rows are deleted, gives way to the last one, in place in the history.
 * Render it once the count is known: before the first rows load, there is no last page to go back to.
 */
export function DataTablePagination({
  table: { page, pageLink, goToPage, pageSize, setPageSize },
  pageSizes,
  results,
  busy = false,
  'aria-label': label,
  ...count
}: PaginationProps) {
  const { t } = useTranslation(['components']);
  const pages =
    count.total === undefined
      ? Math.max(1, Number.isFinite(count.pages) ? count.pages : 1)
      : pageCount(count.total, pageSize);
  // The current page shows in two lists, one for narrow footers: the one shown takes the focus.
  const currentLinks = React.useRef(
    new Set<HTMLAnchorElement | HTMLButtonElement>()
  );
  const currentLink = React.useCallback(
    (node: HTMLAnchorElement | HTMLButtonElement | null) => {
      if (node === null) return;
      currentLinks.current.add(node);
      return () => {
        currentLinks.current.delete(node);
      };
    },
    []
  );
  // Previous or Next, disabled once it reaches its end, can no longer hold the focus it had.
  const refocusOn = React.useRef<number | null>(null);
  React.useEffect(() => {
    const target = refocusOn.current;
    refocusOn.current = null;
    if (target !== page) return;
    [...currentLinks.current].find((link) => link.checkVisibility())?.focus();
  }, [page]);
  // Replaced, not pushed: Back does not lead to the page that was not there.
  const clamp = React.useEffectEvent((last: number) =>
    goToPage(last, { replace: true })
  );
  React.useEffect(() => {
    if (!busy && page > pages) clamp(pages);
  }, [busy, page, pages]);

  const to = (target: number, keepFocus = false) => ({
    link: pageLink(target),
    onGo: () => goToPage(target),
    onActivate: (event: React.MouseEvent) => {
      // A click with a modifier opens another tab and leaves this page where it is.
      if (
        keepFocus &&
        event.button === 0 &&
        !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      )
        refocusOn.current = target;
    },
  });

  const previous = Math.min(page - 1, pages);
  const next = page + 1;
  const pageList = (siblings: number, className: string) => (
    <ul className={className}>
      {pagesAround(page, pages, siblings).map((n) =>
        typeof n === 'string' ? (
          <li key={n}>
            <span
              aria-hidden
              className="flex h-8 w-4 items-center justify-center"
            >
              <MoreHorizontalIcon className="size-4" />
            </span>
          </li>
        ) : (
          <li key={n}>
            <PageControl
              {...to(n)}
              ref={n === page ? currentLink : undefined}
              aria-current={n === page ? 'page' : undefined}
              variant={n === page ? 'secondary' : 'ghost'}
              size="number"
              aria-label={t('components:dataTable.page', { page: n })}
            >
              {n}
            </PageControl>
          </li>
        )
      )}
    </ul>
  );

  return (
    // One line where it fits: on a phone, the count and the pages share it, the size select below them.
    <div
      data-slot="data-table-pagination"
      className="flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <p aria-live="polite" className="text-muted-foreground">
          {results === undefined
            ? t('components:dataTable.pageOf', { page, pages })
            : t('components:dataTable.pageOfResults', {
                page,
                pages,
                results,
              })}
        </p>
        {pageSizes !== undefined && setPageSize !== undefined && (
          <PageSizeSelect
            pageSize={pageSize}
            pageSizes={pageSizes}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
      <nav
        aria-label={label}
        // Wrapped onto a line of its own, it stays at the end, as on a wide footer.
        className="ms-auto flex max-w-full items-center gap-1"
      >
        <PageControl
          variant="ghost"
          size="sm"
          {...to(previous, previous === 1)}
          disabled={previous < 1}
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
          {/* Named by the text it shows, hidden only from sight in a narrow footer: voice control says what it sees. */}
          <span className="sr-only @md:not-sr-only">
            {t('components:dataTable.previous')}
          </span>
        </PageControl>
        {/* A narrow footer keeps the first, current and last pages only; the narrowest, the current one, the count
            beside it telling how many there are. */}
        <span className="flex @xs:hidden">
          <PageControl
            {...to(page)}
            ref={currentLink}
            aria-current="page"
            variant="secondary"
            size="number"
            aria-label={t('components:dataTable.page', { page })}
          >
            {page}
          </PageControl>
        </span>
        {pageList(0, 'hidden items-center gap-1 @xs:flex @sm:hidden')}
        {pageList(1, 'hidden items-center gap-1 @sm:flex')}
        <PageControl
          variant="ghost"
          size="sm"
          {...to(next, next === pages)}
          disabled={page >= pages}
        >
          <span className="sr-only @md:not-sr-only">
            {t('components:dataTable.next')}
          </span>
          <ChevronRightIcon className="rtl:rotate-180" />
        </PageControl>
      </nav>
    </div>
  );
}
