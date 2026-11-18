import { XIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * The rows selected in a table, by id (`getRowId`): what `DataTable` takes as `selection`. The selection is the
 * app's: it holds ids, so it lasts across pages, a sort or a filter, until the app clears it.
 */
export type DataTableSelection<TData> = {
  readonly selected: ReadonlySet<string>;
  readonly onSelectedChange: (selected: ReadonlySet<string>) => void;
  /** Names the checkbox of a row for assistive tech: "Select Ada Lovelace". Defaults to "Select row". */
  readonly rowLabel?: (row: TData) => string;
  /** Whether a row can be selected. Defaults to every row. */
  readonly canSelect?: (row: TData) => boolean;
};

/**
 * The selection of a table, in React state: pass it whole to `DataTable` as `selection`.
 *
 * A search or a filter narrows the selection to the rows it keeps when the app knows them all: pass their ids as
 * `matching` (a filter in memory, or an API that answers the ids that match). When it only knows the page shown, pass
 * `resetOn: table.filtersKey` instead, and a new search or filter clears the selection. Either way, a bulk action never
 * reaches a row the user no longer sees among the results.
 */
export function useDataTableSelection<TData>(
  options: Pick<DataTableSelection<TData>, 'rowLabel' | 'canSelect'> & {
    readonly initial?: Iterable<string>;
    /** The ids of every row the search and the filters keep, on every page; `undefined` while they are unknown. */
    readonly matching?: Iterable<string> | undefined;
    /** Clears the selection whenever it changes: `table.filtersKey`. */
    readonly resetOn?: unknown;
  } = {}
) {
  const { initial, matching, resetOn, ...rest } = options;
  const [stored, setStored] = React.useState<ReadonlySet<string>>(
    () => new Set(initial)
  );
  const [lastReset, setLastReset] = React.useState(resetOn);
  // Adjusted while rendering, as React advises for state that follows a prop: no render shows the stale selection.
  if (!Object.is(lastReset, resetOn)) {
    setLastReset(resetOn);
    setStored(new Set());
  }
  const kept = matching === undefined ? undefined : new Set(matching);
  const selected =
    kept === undefined || [...stored].every((id) => kept.has(id))
      ? stored
      : new Set([...stored].filter((id) => kept.has(id)));
  // Narrowed for good: removing the filter does not bring back rows the user saw leave the selection.
  if (selected !== stored) setStored(selected);

  const { rowLabel, canSelect } = rest;
  // The same object while the selection stays the same: the checkboxes of the table do not render again. `selected`
  // is `stored` but in the render that narrows it, which stores the narrowed set at once.
  return React.useMemo(
    () => ({
      ...(rowLabel !== undefined && { rowLabel }),
      ...(canSelect !== undefined && { canSelect }),
      selected,
      onSelectedChange: setStored,
      /** How many rows are selected. */
      count: selected.size,
      /** The ids selected, in the order they were selected. */
      ids: [...selected],
      isSelected: (id: string) => selected.has(id),
      clear: () => setStored(new Set()),
    }),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- `selected` is the same set while the selection is
    [selected, rowLabel, canSelect]
  );
}

export type SelectionModel = {
  /** The ids of the rows of the table that can be selected, in their order. */
  readonly selectable: ReadonlyArray<string>;
  /** The same, to look one up in a large table. */
  readonly selectableSet: ReadonlySet<string>;
  readonly selected: ReadonlySet<string>;
  readonly onSelectedChange: (selected: ReadonlySet<string>) => void;
  readonly label: (rowId: string) => string | undefined;
  /** Whether the rows selectable are all the rows, though only some show (a virtual table). */
  readonly allRows: boolean;
  /** The last row ticked, the start of a range: shared by every checkbox of the table. */
  readonly anchor: {
    readonly get: () => string | null;
    readonly set: (rowId: string) => void;
  };
};

/**
 * Ticks or unticks a row, or with `range` every row from the last one ticked to it, as a file list does: what a row
 * checkbox does, and Space on a focused row.
 */
export const selectRows = (
  model: SelectionModel,
  rowId: string,
  checked: boolean,
  range: boolean
) => {
  const { selectable, selected, onSelectedChange, anchor } = model;
  const from =
    anchor.get() === null ? -1 : selectable.indexOf(anchor.get() ?? '');
  const to = selectable.indexOf(rowId);
  const rows =
    range && from !== -1 && to !== -1
      ? selectable.slice(Math.min(from, to), Math.max(from, to) + 1)
      : [rowId];
  const next = new Set(selected);
  for (const id of rows) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  anchor.set(rowId);
  onSelectedChange(next);
};

export const SelectionContext = React.createContext<SelectionModel | null>(
  null
);

const useSelectionModel = () => {
  const model = React.use(SelectionContext);
  if (model === null)
    throw new Error('A selection cell renders inside a DataTable.');
  return model;
};

/** The checkbox in the header: selects or clears every row of the table that can be selected. */
export function SelectAllCheckbox() {
  const { t } = useTranslation(['components']);
  const { selectable, selected, onSelectedChange, allRows } =
    useSelectionModel();
  const count = selectable.filter((id) => selected.has(id)).length;
  const all = count > 0 && count === selectable.length;
  return (
    <Checkbox
      data-slot="data-table-select-all"
      noLabel
      aria-label={
        allRows
          ? t('components:dataTable.selection.selectAllRows')
          : t('components:dataTable.selection.selectAll')
      }
      checked={all}
      indeterminate={count > 0 && !all}
      disabled={selectable.length === 0}
      onCheckedChange={() => {
        const next = new Set(selected);
        // Partly selected, it selects every row; selected, it clears them. Rows of other pages stay as they are.
        for (const id of selectable) {
          if (all) next.delete(id);
          else next.add(id);
        }
        onSelectedChange(next);
      }}
    />
  );
}

/**
 * The checkbox of a row. Shift + click selects or clears every row between it and the last one ticked, as a file
 * list does.
 */
export function SelectRowCheckbox({ rowId }: { rowId: string }) {
  const { t } = useTranslation(['components']);
  const model = useSelectionModel();
  const { selectableSet, selected, label } = model;
  const shift = React.useRef(false);
  const canSelect = selectableSet.has(rowId);
  return (
    // The change event of a checkbox does not tell whether Shift was held: the press does, before the change.
    <span
      className="flex"
      // Read on the press, not the click: Base UI ticks the box through a click of its hidden input, without Shift.
      onPointerDownCapture={(event) => {
        shift.current = event.shiftKey;
      }}
      onKeyDownCapture={(event) => {
        if (event.key === ' ') shift.current = event.shiftKey;
      }}
    >
      <Checkbox
        data-slot="data-table-select-row"
        noLabel
        aria-label={
          label(rowId) ?? t('components:dataTable.selection.selectRow')
        }
        checked={selected.has(rowId)}
        disabled={!canSelect}
        onCheckedChange={(checked) => {
          selectRows(model, rowId, checked, shift.current);
          shift.current = false;
        }}
      />
    </span>
  );
}

/**
 * While rows are selected: how many, the actions on them (`children`), and a button that clears the selection. Give the
 * selection to `DataTableToolbar` instead, and the bar takes the toolbar's place while rows are selected: the table
 * does not move. On its own, it shows above the table only while rows are selected, and moves the table down as it
 * shows: prefer the toolbar's. Either way, the count reaches
 * screen readers from the first row ticked, and the focus it held once the selection clears (its clear button, a bulk
 * action) goes to `focusOnEmpty`, by default the "select all" box of the table that follows it.
 */
export function DataTableSelectionBar({
  count,
  onClear,
  focusOnEmpty,
  children,
}: {
  count: number;
  onClear: () => void;
  /** Where the focus goes from the bar once nothing is selected and it hides. */
  focusOnEmpty?: () => HTMLElement | null | undefined;
  /** The actions on the rows selected. */
  children?: React.ReactNode;
}) {
  const { t } = useTranslation(['components']);
  const label = t('components:dataTable.selectedCount', { count });
  const bar = React.useRef<HTMLDivElement>(null);
  const hadFocus = React.useRef(false);
  React.useLayoutEffect(() => {
    if (count > 0 || !hadFocus.current) return;
    hadFocus.current = false;
    const active = document.activeElement;
    // The focus moved on by itself (a dialog the action opened): it stays there.
    if (
      active !== null &&
      active !== document.body &&
      !bar.current?.contains(active)
    )
      return;
    // By default, the "select all" box of the nearest table around the bar.
    let around = bar.current?.parentElement ?? null;
    while (
      around !== null &&
      around.querySelector('[data-slot=data-table]') === null
    )
      around = around.parentElement;
    const target =
      focusOnEmpty?.() ??
      around?.querySelector<HTMLElement>(
        '[data-slot=data-table] thead [role=checkbox]'
      );
    target?.focus();
  }, [count, focusOnEmpty]);
  return (
    <>
      <span role="status" className="sr-only">
        {count > 0 ? label : ''}
      </span>
      <div
        ref={bar}
        data-slot="data-table-selection-bar"
        role="region"
        aria-label={label}
        hidden={count === 0}
        className="flex min-h-8 flex-wrap items-center gap-1 self-end rounded-md bg-muted p-1 ps-3 text-sm"
        onFocus={() => {
          hadFocus.current = true;
        }}
        onBlur={() => {
          // Hidden with the focus inside, the bar loses it to nothing: that blur is the one to act on. Any other (a
          // click on the page) lets the focus go for good.
          if (!bar.current?.hidden) hadFocus.current = false;
        }}
      >
        <span
          aria-hidden
          className="me-1 font-medium whitespace-nowrap tabular-nums"
        >
          {label}
        </span>
        <div className="flex flex-wrap items-center gap-1">{children}</div>
        <Button
          variant="ghost"
          size="icon-xs"
          className="ms-auto"
          aria-label={t('components:dataTable.selection.clear')}
          onClick={onClear}
        >
          <XIcon />
        </Button>
      </div>
    </>
  );
}
