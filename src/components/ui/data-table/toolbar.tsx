import { XIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { DataTableAddFilter } from '@/components/ui/data-table/filters/add-filter';
import { DataTableFilterChip } from '@/components/ui/data-table/filters/filter';
import { DataTableSelectionBar } from '@/components/ui/data-table/selection';
import type { DataTableToolbarModel } from '@/components/ui/data-table/use-data-table';
import { SearchInput } from '@/components/ui/search-input';

/**
 * Above a table: its search (when `search` is given), its filters, a reset once anything narrows the rows, and
 * `children`, the app's own actions, at the end of the row. While rows are selected, `selection` takes its place: how
 * many, the actions on them, and a way to clear them.
 */
export function DataTableToolbar({
  table,
  search,
  selection,
  selectionActions,
  children,
}: {
  table: {
    readonly toolbar: DataTableToolbarModel;
    readonly isFiltered: boolean;
    readonly reset: () => void;
  };
  search?: Omit<
    React.ComponentProps<typeof SearchInput>,
    'ref' | 'value' | 'defaultValue' | 'onChange'
  >;
  /** What `useDataTableSelection` answers: while it holds rows, the bar of `selectionActions` replaces the toolbar. */
  selection?: { readonly count: number; readonly clear: () => void };
  /** The actions on the rows selected. */
  selectionActions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation(['components']);
  const {
    searchRef,
    attachAddFilter,
    search: text,
    onSearch,
    addable,
    onAdd,
    chips,
    onSearchShown,
    revealRequests,
  } = table.toolbar;
  const searchShown = search !== undefined;
  // Before paint: a column header that filters by the search shows its button from the first frame.
  React.useLayoutEffect(() => {
    onSearchShown(searchShown);
    return () => onSearchShown(false);
  }, [onSearchShown, searchShown]);
  const count = selection?.count ?? 0;
  // A filter asked for from a column header shows the toolbar again, until the selection changes.
  const [reveal, setReveal] = React.useState({
    request: revealRequests,
    count,
    active: false,
  });
  if (revealRequests !== reveal.request)
    setReveal({ request: revealRequests, count, active: true });
  else if (reveal.active && count !== reveal.count)
    setReveal({ ...reveal, count, active: false });
  const selecting = count > 0 && !(reveal.active && reveal.count === count);
  const root = React.useRef<HTMLDivElement>(null);
  const controls = React.useRef<HTMLDivElement>(null);
  const focusOnEmpty = React.useCallback(
    () =>
      controls.current?.querySelector<HTMLElement>(
        'input:not(:disabled), button:not(:disabled)'
      ),
    []
  );
  // Rows selected from a control of the toolbar (an action, a shortcut) hide it: its focus goes to the bar.
  React.useLayoutEffect(() => {
    if (!selecting || !controls.current?.contains(document.activeElement))
      return;
    root.current
      ?.querySelector<HTMLElement>(
        '[data-slot=data-table-selection-bar] button:not(:disabled)'
      )
      ?.focus();
  }, [selecting]);
  // The bar and the controls share one cell: the taller sets its height, so the table does not move when they swap.
  return (
    <div
      ref={root}
      data-slot="data-table-toolbar"
      className="grid grid-cols-1 *:col-start-1 *:row-start-1"
    >
      {selection !== undefined && (
        <DataTableSelectionBar
          count={selecting ? count : 0}
          onClear={selection.clear}
          focusOnEmpty={focusOnEmpty}
        >
          {selectionActions}
        </DataTableSelectionBar>
      )}
      <div
        ref={controls}
        inert={selecting}
        className={cn(
          'flex flex-wrap items-start gap-2',
          selecting && 'invisible'
        )}
      >
        {/* The filters wrap in their own box: the app's actions keep their place at the end of the first line. */}
        <div className="flex min-w-0 flex-1 basis-64 flex-wrap items-center gap-2">
          {search !== undefined && (
            <SearchInput
              size="sm"
              className="w-64 max-w-full"
              delay={300}
              {...search}
              ref={searchRef}
              value={text}
              onChange={(value) => onSearch(value ?? '')}
            />
          )}
          {chips.map(({ key, ...chip }) => (
            <DataTableFilterChip key={key} {...chip} />
          ))}
          <DataTableAddFilter
            ref={attachAddFilter}
            filters={addable}
            onAdd={onAdd}
          />
          {table.isFiltered && (
            <Button variant="ghost" size="sm" onClick={table.reset}>
              <XIcon />
              {t('components:dataTable.states.clearFilters')}
            </Button>
          )}
        </div>
        {children !== undefined && (
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
