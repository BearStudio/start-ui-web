import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import {
  type ColumnDef,
  type Row,
  type RowData,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ComponentProps, ReactNode } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import {
  type DataTableSelection,
  SelectAllCheckbox,
  SelectionContext,
  SelectRowCheckbox,
  selectRows,
} from '@/components/ui/data-table/selection';
import type {
  DataTableFilterKey,
  DataTableSorting,
  DataTableStateValue,
  SortDirection,
} from '@/components/ui/data-table/state';
import { ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const features = tableFeatures({});

const ariaSort = { asc: 'ascending', desc: 'descending' } as const;

type ColumnDefOf<TData extends RowData> = ColumnDef<
  typeof features,
  TData,
  // oxlint-disable-next-line typescript/no-explicit-any -- the columns of one table hold values of different types
  any
>;

// `ColumnDef` is a union of the accessor and display columns: omit from each, not from what they share.
type OmitEach<T, Key extends PropertyKey> = T extends unknown
  ? Omit<T, Key>
  : never;

/** What the headers of a table read from it, which `useDataTable` answers. */
export type DataTableHeaders<
  Sort extends string = string,
  FilterKey extends string = string,
> = {
  readonly sorting: DataTableSorting<Sort>;
  readonly sortHeader: (column: Sort) => {
    sorted: SortDirection | undefined;
    onSort: (direction: SortDirection) => void;
  };
  readonly openFilter: (key: FilterKey | 'search') => void;
  /** Whether a header can offer `target` as its filter: the search only while the toolbar shows one. */
  readonly canFilter?: (target: FilterKey | 'search') => boolean;
  /** The ids of the columns left out. */
  readonly hiddenColumns?: ReadonlyArray<string>;
  /** The ids of the columns pinned at the start of the rows, in order. */
  readonly pinnedColumns?: ReadonlyArray<string>;
  /** Changes whenever other rows show (a page, a sorting, a search): the rows scroll back to the top. */
  readonly rowsKey?: string;
};

/** How a column sits in its row, whether its header is built by the table or not. */
type ColumnLayout = {
  /** `'end'`: the column stays at the end of the row while the others scroll, as narrow as its content. */
  readonly sticky?: 'end';
  /** `true`: the column is as narrow as its content, such as the actions of a row. */
  readonly shrink?: boolean;
  /** `'end'`: the header and cells sit at the end, for numbers and amounts, in tabular figures. */
  readonly align?: 'start' | 'end';
  /**
   * The width of the column, in pixels, at least: rows narrower keep it from one page to the next; a value wider than
   * it widens the column, as cells do not wrap.
   */
  readonly size?: number;
};

/**
 * A column whose header the table builds from its `title`: sorted by its `id` when `sortable`, which must then be a
 * column the state sorts by, and with a shortcut to the filter `filter`, a filter of the table or `"search"`.
 */
export type DataTableTitledColumn<
  TData extends RowData,
  Sort extends string = string,
  FilterKey extends string = string,
> = OmitEach<ColumnDefOf<TData>, 'header' | 'id' | 'columns'> & {
  readonly title: string;
  readonly filter?: FilterKey | 'search';
  readonly columns?: never;
} & ColumnLayout &
  (
    | { readonly id: Sort; readonly sortable: true }
    | { readonly id: string; readonly sortable?: false }
  );

/**
 * Columns under one header, which spans them: a column split in two, or more. Its header sorts nothing, and may
 * hold a shortcut to the filter `filter`.
 */
export type DataTableColumnGroup<
  TData extends RowData,
  Sort extends string = string,
  FilterKey extends string = string,
> = {
  readonly id: string;
  readonly title: string;
  readonly columns: ReadonlyArray<DataTableColumn<TData, Sort, FilterKey>>;
  readonly sortable?: never;
  readonly filter?: FilterKey | 'search';
};

/** A column: titled, its header built by the table, with a `header` of its own, or a group of columns. */
export type DataTableColumn<
  TData extends RowData,
  Sort extends string = string,
  FilterKey extends string = string,
> =
  | DataTableTitledColumn<TData, Sort, FilterKey>
  | DataTableColumnGroup<TData, Sort, FilterKey>
  | (OmitEach<ColumnDefOf<TData>, 'columns'> & {
      readonly columns?: never;
      readonly title?: never;
      readonly sortable?: never;
      readonly filter?: never;
    } & ColumnLayout);

/**
 * The columns of a table over the state `S`: sorted by the columns it sorts by, filtered by its filters. A table
 * with a filter for only some fields of its state names them in `FilterKey`.
 */
export type DataTableColumnFor<
  TData extends RowData,
  S extends DataTableStateValue,
  FilterKey extends DataTableFilterKey<S> = DataTableFilterKey<S>,
> = DataTableColumn<TData, NonNullable<S['orderBy']>, FilterKey>;

function TitledHeader({
  column,
  table,
}: {
  column: DataTableTitledColumn<RowData>;
  table: DataTableHeaders | undefined;
}) {
  const { filter } = column;
  const onFilter =
    filter === undefined ||
    table === undefined ||
    !(table.canFilter?.(filter) ?? true)
      ? undefined
      : () => table.openFilter(filter);
  const align = column.align ?? 'start';
  if (column.sortable === true && table !== undefined)
    return (
      <DataTableColumnHeader
        title={column.title}
        align={align}
        {...table.sortHeader(column.id)}
        {...(onFilter !== undefined && { onFilter })}
      />
    );
  if (onFilter !== undefined)
    return (
      <DataTableColumnHeader
        title={column.title}
        align={align}
        onFilter={onFilter}
      />
    );
  return column.title;
}

const isTitled = (column: unknown): column is DataTableTitledColumn<RowData> =>
  typeof column === 'object' &&
  column !== null &&
  'title' in column &&
  typeof column.title === 'string';

const isGroup = (column: unknown): column is DataTableColumnGroup<RowData> =>
  isTitled(column) && 'columns' in column && Array.isArray(column.columns);

/** The columns but the hidden ones, and a group whose columns are all hidden. */
const visibleColumns = <Column extends DataTableColumn<RowData>>(
  columns: ReadonlyArray<Column>,
  hidden: ReadonlySet<string>
): ReadonlyArray<Column> =>
  columns.flatMap((column) => {
    // Only a column with a title hides: the menu of columns lists no other, so nothing would bring it back.
    if (!isGroup(column))
      return isTitled(column) &&
        column.id !== undefined &&
        hidden.has(column.id)
        ? []
        : [column];
    const kept = visibleColumns(column.columns, hidden);
    return kept.length === 0 ? [] : [{ ...column, columns: kept }];
  });

const hasTitledLeaf = (
  columns: ReadonlyArray<DataTableColumn<RowData>>
): boolean =>
  columns.some((column) =>
    isGroup(column) ? hasTitledLeaf(column.columns) : isTitled(column)
  );

/** The layout a column asks for: read from its definition, which TanStack hands back as it was given. */
const layoutOf = (column: unknown, id: string) => {
  const layout = (
    typeof column === 'object' && column !== null ? column : {}
  ) as ColumnLayout;
  return {
    sticky: layout.sticky === 'end' ? ('end' as const) : false,
    shrink: layout.shrink === true || id === selectColumnId,
    align: layout.align ?? 'start',
    size: layout.size,
  };
};

const selectColumnId = '__select';

// The message of an empty slot, as its state marks it, or its text but that of its controls (a "Clear filters" button
// is no part of "No results").
const messageOf = (slot: HTMLElement) => {
  const marked = slot.querySelectorAll('[data-slot=data-table-state-message]');
  if (marked.length > 0)
    return [...marked].map((node) => (node.textContent ?? '').trim()).join(' ');
  const parts: Array<string> = [];
  const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode())
    if (node.parentElement?.closest('button, a, [role=button]') === null)
      parts.push((node.textContent ?? '').trim());
  return parts.filter((part) => part !== '').join(' ');
};

// Declared once: a header or cell renderer made anew is a new component, whose checkboxes would mount again (and lose
// the focus) whenever the columns change.
const SelectHeader = () => <SelectAllCheckbox />;
const SelectCell = ({ row }: { row: { id: string } }) => (
  <SelectRowCheckbox rowId={row.id} />
);
const selectColumn: ColumnDefOf<RowData> = {
  id: selectColumnId,
  header: SelectHeader,
  cell: SelectCell,
};

// What a click on a row leaves alone: its own controls, and what renders outside it (a menu, a dialog opened from it,
// whose React events still bubble through the row).
const interactive =
  'a, button, input, select, textarea, label, summary, [role=button], [role=link], [role=menuitem], [role=checkbox], [role=switch], [data-row-click-ignore]';

const isOwnClick = (event: React.MouseEvent<HTMLElement>) => {
  const target = event.target as Element;
  if (!event.currentTarget.contains(target)) return false;
  const control = target.closest(interactive);
  if (control !== null && event.currentTarget.contains(control)) return false;
  // A drag that selected text is not a click.
  return (window.getSelection()?.toString() ?? '') === '';
};

const definitionOf = (
  column: DataTableColumn<RowData>
): ColumnDefOf<RowData> => {
  if (isGroup(column))
    return {
      ...column,
      header: column.title,
      columns: column.columns.map(definitionOf),
    };
  return isTitled(column) ? { ...column, header: column.title } : column;
};

/** The title of the column `id`, among groups too. */
const titleOf = (
  columns: ReadonlyArray<DataTableColumn<RowData>>,
  id: string
): string | undefined => {
  for (const column of columns) {
    if (isGroup(column)) {
      const inner = titleOf(column.columns, id);
      if (inner !== undefined) return inner;
    } else if (column.id === id && isTitled(column)) return column.title;
  }
  return undefined;
};

/** Watches the width of an element and the height of another, in pixels. */
const useSize = (
  width: React.RefObject<HTMLElement | null>,
  height: React.RefObject<HTMLElement | null>
) => {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const measure = () =>
      setSize({
        width: width.current?.clientWidth ?? 0,
        height: height.current?.offsetHeight ?? 0,
      });
    measure();
    const observer = new ResizeObserver(measure);
    if (width.current !== null) observer.observe(width.current);
    if (height.current !== null) observer.observe(height.current);
    return () => observer.disconnect();
  }, [width, height]);
  return size;
};

type RowClickEvent =
  | React.MouseEvent<HTMLTableRowElement>
  | React.KeyboardEvent<HTMLTableRowElement>;

export function DataTable<
  TData extends RowData,
  Sort extends string = string,
  FilterKey extends string = string,
>({
  table: headers,
  columns,
  data,
  empty,
  footer,
  getRowId,
  label,
  virtual,
  onRowClick,
  selection,
  busy = false,
  className,
  ...props
}: {
  /** What `useDataTable` answers: the headers sort and filter through it, and tell assistive tech the sorting. */
  table?: DataTableHeaders<Sort, FilterKey>;
  /** Declared outside the component, or memoized: new columns on every render rebuild the table every time. */
  columns: ReadonlyArray<
    DataTableColumn<TData, NoInfer<Sort>, NoInfer<FilterKey>>
  >;
  data: ReadonlyArray<TData>;
  /** What the body shows with no row: `DataTableEmptyState`, `DataTableLoadingState`, `DataTableErrorState`. */
  empty?: ReactNode;
  footer?: ReactNode;
  /** The accessible name of the table, which tells it from another one on the page. */
  label?: string;
  /**
   * Renders only the rows in view, and a few around them, for a table of thousands of rows that does not page. Its
   * parent must bound its height. `rowHeight` is the height, in pixels, a row is taken to have until it is measured.
   */
  virtual?: { readonly rowHeight: number; readonly overscan?: number };
  /**
   * Makes each row open something (a dialog, a page) on a click anywhere in it, but on its own buttons, links and
   * menus, which keep their action. The rows themselves are one stop of the Tab key, their own controls keep theirs:
   * the arrow keys move between rows, and Enter opens one. The event tells a click with a modifier, to open a new tab.
   */
  onRowClick?: (row: TData, event: RowClickEvent) => void;
  /** True while other rows load: the rows shown fade, and assistive tech hears the table is busy. */
  busy?: boolean;
} & (
  | {
      /**
       * Adds a checkbox at the start of each row, and one in the header that selects them all:
       * `useDataTableSelection` answers it. Rows are selected by id: `getRowId` says which.
       */
      selection: DataTableSelection<TData>;
      getRowId: (row: TData) => string;
    }
  | {
      selection?: undefined;
      /**
       * Keys the rows: by default a row is its index, the same from one page to the next. Without it, nor
       * `useDataTable`'s `table`, the table cannot tell other rows from the same, and keeps their scroll.
       */
      getRowId?: (row: TData) => string;
    }
) &
  Omit<ComponentProps<'div'>, 'children'>) {
  const { t } = useTranslation(['components']);
  const sorting = headers?.sorting;
  const hiddenKey = (headers?.hiddenColumns ?? []).join('\n');
  const pinnedKey = (headers?.pinnedColumns ?? []).join('\n');
  const selectable = selection !== undefined;
  // The last row ticked, from which Shift + click selects a range.
  const anchor = React.useRef<string | null>(null);
  // Columns declared once keep their identity, so the table does not rebuild them on every render. The checkboxes
  // read the selection from a context, so a new selection does not rebuild them either.
  const { definitions, pinned } = React.useMemo(() => {
    const all = columns as ReadonlyArray<DataTableColumn<RowData>>;
    const visible = visibleColumns(
      all,
      new Set(hiddenKey === '' ? [] : hiddenKey.split('\n'))
    );
    // A URL that hides every column with a title hides none, as the menu of columns reads it: a table of its untitled
    // columns only (the actions of a row) is no table.
    const kept = hasTitledLeaf(visible) ? visible : all;
    // Pinned columns come first, in the order they were pinned: only a column with a title, outside any group (a
    // group's header spans its columns, which must stay together).
    const pins = (pinnedKey === '' ? [] : pinnedKey.split('\n')).flatMap((id) =>
      kept.filter(
        (column) => !isGroup(column) && isTitled(column) && column.id === id
      )
    );
    const ordered = [
      ...pins,
      ...kept.filter((column) => !pins.includes(column)),
    ].map(definitionOf);
    return {
      definitions: (selectable
        ? [selectColumn, ...ordered]
        : ordered) as ReadonlyArray<ColumnDefOf<TData>>,
      pinned: pins.map((column) => column.id ?? ''),
    };
  }, [columns, hiddenKey, pinnedKey, selectable]);
  const table = useTable({
    features,
    columns: definitions,
    data,
    ...(getRowId && { getRowId }),
  });
  const rows = table.getRowModel().rows;
  const selected = selection?.selected;
  const onSelectedChange = selection?.onSelectedChange;
  const canSelect = selection?.canSelect;
  const rowLabel = selection?.rowLabel;
  // Computed when the rows or the callbacks change, not on every render (a virtual table renders on every frame of a
  // scroll); kept by what they answer, so `canSelect` and `rowLabel` written inline do not make every checkbox render
  // again.
  const selecting = selected !== undefined;
  const { selectableKey, labelsKey } = React.useMemo(
    () => ({
      selectableKey: selecting
        ? rows
            .filter((row) => canSelect?.(row.original) ?? true)
            .map((row) => row.id)
            .join('\n')
        : '',
      labelsKey:
        selecting && rowLabel !== undefined
          ? JSON.stringify(rows.map((row) => rowLabel(row.original)))
          : '[]',
    }),
    [rows, selecting, canSelect, rowLabel]
  );
  const allRows = virtual !== undefined;
  const selectionModel = React.useMemo(() => {
    if (selected === undefined || onSelectedChange === undefined) return null;
    const ids = rows.map((row) => row.id);
    const selectable = selectableKey === '' ? [] : selectableKey.split('\n');
    const labelOf = new Map<string, string>(
      (JSON.parse(labelsKey) as ReadonlyArray<string>).flatMap((label, i) =>
        label === '' ? [] : [[ids[i] ?? '', label]]
      )
    );
    return {
      selectable,
      selectableSet: new Set(selectable),
      selected,
      onSelectedChange,
      // A virtual table renders the rows in view only, but selects them all.
      allRows,
      anchor: {
        get: () => anchor.current,
        set: (rowId: string) => {
          anchor.current = rowId;
        },
      },
      label: (rowId: string) => labelOf.get(rowId),
    };
  }, [rows, selected, onSelectedChange, selectableKey, labelsKey, allRows]);
  const columnCount = table.getAllLeafColumns().length;
  const hasStickyEnd = table
    .getAllLeafColumns()
    .some((column) => layoutOf(column.columnDef, column.id).sticky === 'end');
  const headerGroups = table.getHeaderGroups();
  const viewport = React.useRef<HTMLDivElement>(null);
  const head = React.useRef<HTMLTableSectionElement>(null);
  const size = useSize(viewport, head);

  // The columns held at the start: the checkbox column with the pinned ones, then the pinned ones in order. Each sits
  // at the width of those before it, measured on their headers.
  const pinChain = React.useMemo(
    () =>
      pinned.length === 0
        ? []
        : selectable
          ? [selectColumnId, ...pinned]
          : pinned,
    [pinned, selectable]
  );
  const pinHeads = React.useRef(new Map<string, HTMLTableCellElement>());
  const [pinOffsets, setPinOffsets] = React.useState<
    Readonly<Record<string, number>>
  >({});
  React.useLayoutEffect(() => {
    const measure = () => {
      let start = 0;
      const next: Record<string, number> = {};
      for (const id of pinChain) {
        next[id] = start;
        start += pinHeads.current.get(id)?.offsetWidth ?? 0;
      }
      setPinOffsets((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const id of pinChain) {
      const cell = pinHeads.current.get(id);
      if (cell !== undefined) observer.observe(cell);
    }
    return () => observer.disconnect();
  }, [pinChain]);
  const pinOf = (id: string) => {
    const at = pinChain.indexOf(id);
    return at === -1
      ? undefined
      : { start: pinOffsets[id] ?? 0, edge: at === pinChain.length - 1 };
  };
  const pinHead = (id: string) => (cell: HTMLTableCellElement | null) => {
    if (cell === null) pinHeads.current.delete(id);
    else pinHeads.current.set(id, cell);
  };
  // oxlint-disable-next-line react/incompatible-library -- the app builds without the React Compiler, which would skip this component
  const virtualizer = useVirtualizer({
    enabled: virtual !== undefined,
    count: rows.length,
    getScrollElement: () => viewport.current,
    estimateSize: () => virtual?.rowHeight ?? 0,
    // The sticky header covers the top of the viewport: a row scrolled to lands below it.
    scrollPaddingStart: size.height,
    overscan: virtual?.overscan ?? 8,
  });
  const items = virtualizer.getVirtualItems();

  // Other rows (a page, a sorting, a search) start from the top: the scroll of the old ones means nothing to them.
  // More rows of the same list, loaded at its end, keep their place.
  const rowsKey = headers?.rowsKey ?? rows[0]?.id;
  const lastRowsKey = React.useRef(rowsKey);
  const [activeRow, setActiveRow] = React.useState<string | null>(null);
  // Before paint: the new rows never show at the old scroll.
  React.useLayoutEffect(() => {
    if (lastRowsKey.current === rowsKey) return;
    lastRowsKey.current = rowsKey;
    viewport.current?.scrollTo({ top: 0 });
    // Other rows start from the first: a row keyed by its index would carry the Tab stop over from the last page.
    setActiveRow(null);
  }, [rowsKey]);

  // Most screen readers say nothing when `aria-sort` changes: the table says the new sorting itself.
  const sortingKey =
    sorting === undefined ? '' : `${sorting.column}:${sorting.direction}`;
  const [lastSortingKey, setLastSortingKey] = React.useState(sortingKey);
  // Two messages, each in its own region: a sorting that empties the rows while they load is said along with
  // "Loading…", and not again with every empty result after it.
  const [sortMessage, setSortMessage] = React.useState('');
  const [emptyMessage, setEmptyMessage] = React.useState('');
  if (lastSortingKey !== sortingKey) {
    setLastSortingKey(sortingKey);
    const title =
      sorting === undefined
        ? undefined
        : titleOf(
            columns as ReadonlyArray<DataTableColumn<RowData>>,
            sorting.column
          );
    setSortMessage(
      sorting === undefined || title === undefined
        ? ''
        : t(
            sorting.direction === 'asc'
              ? 'components:dataTable.sortedAscending'
              : 'components:dataTable.sortedDescending',
            { title }
          )
    );
  }

  // Without pagination to say it, rows that go to none, or load, say so: what the empty slot shows (its alert, an
  // error, speaks for itself).
  const emptySlot = React.useRef<HTMLDivElement>(null);
  const lastEmptyText = React.useRef('');
  React.useLayoutEffect(() => {
    const read = () => {
      const slot = emptySlot.current;
      const text =
        rows.length > 0 || slot === null || slot.querySelector('[role=alert]')
          ? ''
          : messageOf(slot);
      if (text === lastEmptyText.current) return;
      lastEmptyText.current = text;
      // Rows back, the message goes: it would be stale, and the same one later would be no change to announce.
      setEmptyMessage(text);
    };
    read();
    // The slot's content may change on its own (a new language, a state of the app's): it is read again then.
    const slot = emptySlot.current;
    if (slot === null || rows.length > 0) return;
    const observer = new MutationObserver(read);
    observer.observe(slot, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [rows.length, empty]);

  // Clickable rows are one stop of the Tab key, at the row last focused (the first at the start).
  // In a virtual table, only the rows in view are rendered: the first of them when the last focused is not.
  const rendered =
    virtual === undefined
      ? rows
      : items.flatMap((item) => rows[item.index] ?? []);
  // Not the first rendered, which may be one of the rows kept above the view: the first in view, so Tab does not
  // scroll the table back.
  const firstInView =
    virtual === undefined
      ? rows[0]
      : rows[
          items.find((item) => item.start >= (virtualizer.scrollOffset ?? 0))
            ?.index ??
            items[0]?.index ??
            0
        ];
  const tabbableRow =
    activeRow !== null && rendered.some((row) => row.id === activeRow)
      ? activeRow
      : firstInView?.id;
  const hintId = React.useId();
  // A row asked for and not rendered yet: a new request, or the table gone, gives up on it.
  const focusFrame = React.useRef(0);
  React.useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);
  const focusRow = (index: number) => {
    cancelAnimationFrame(focusFrame.current);
    const target = Math.min(Math.max(index, 0), rows.length - 1);
    const find = () =>
      viewport.current?.querySelector<HTMLElement>(
        `[data-row-index="${target}"]`
      );
    const element = find();
    if (element !== null && element !== undefined) {
      element.focus();
      return;
    }
    // A row out of view in a virtual table is not rendered yet: it is once scrolled to, and measured, which may take
    // a few frames.
    virtualizer.scrollToIndex(target);
    let frames = 0;
    const retry = () => {
      const found = find();
      if (found !== null && found !== undefined) found.focus();
      else if (++frames < 10) focusFrame.current = requestAnimationFrame(retry);
    };
    focusFrame.current = requestAnimationFrame(retry);
  };
  // The empty slot goes once rows come (a retry that worked): the focus it held (its button) goes to the scroll area
  // rather than the page.
  const keepFocusInTable = React.useCallback((node: HTMLDivElement | null) => {
    emptySlot.current = node;
    return () => {
      emptySlot.current = null;
      if (node !== null && node.contains(document.activeElement))
        viewport.current?.focus({ preventScroll: true });
    };
  }, []);
  // A focused row that goes (deleted, filtered out) leaves the focus to the scroll area rather than the page.
  const keepRowFocus = React.useCallback(
    (node: HTMLTableRowElement | null) => () => {
      if (node !== null && document.activeElement === node)
        viewport.current?.focus({ preventScroll: true });
    },
    []
  );
  // A focused row scrolled out of a virtual table leaves it: the focus goes to the scroll area rather than the page.
  const measureRow = React.useCallback(
    (node: HTMLTableRowElement | null) => {
      virtualizer.measureElement(node);
      return () => {
        if (node !== null && document.activeElement === node)
          viewport.current?.focus({ preventScroll: true });
        // Lets the virtualizer forget the rows gone from the page.
        virtualizer.measureElement(null);
      };
    },
    [virtualizer]
  );

  const renderRow = (row: Row<typeof features, TData>, index: number) => (
    <TableRow
      key={row.id}
      data-row-index={index}
      data-state={selected?.has(row.id) ? 'selected' : undefined}
      interactive={onRowClick !== undefined}
      {...(onRowClick && {
        ...(virtual === undefined && { ref: keepRowFocus }),
        tabIndex: row.id === tabbableRow ? 0 : -1,
        // Said when the focus enters the rows, not again on every row it moves to.
        'aria-describedby': row.id === tabbableRow ? hintId : undefined,
        onFocus: (event: React.FocusEvent<HTMLTableRowElement>) => {
          if (event.target === event.currentTarget) setActiveRow(row.id);
        },
        onClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
          if (isOwnClick(event)) onRowClick(row.original, event);
        },
        // The middle button clicks through `auxclick`: it opens the row too, the event telling where (a new tab).
        onAuxClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
          if (event.button === 1 && isOwnClick(event))
            onRowClick(row.original, event);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => {
          if (event.target !== event.currentTarget) return;
          // Alt and Ctrl with a key belong to the browser and the app; Cmd with an arrow goes to the end, as on macOS.
          if (event.altKey || event.ctrlKey) return;
          if (
            event.metaKey &&
            event.key !== 'ArrowUp' &&
            event.key !== 'ArrowDown'
          )
            return;
          // A page of rows: as many as show below the header, in the viewport and the window both (a table of
          // unbounded height is as tall as its rows).
          const box = viewport.current?.getBoundingClientRect();
          const shown =
            box === undefined
              ? 0
              : Math.min(box.bottom, window.innerHeight) -
                Math.max(box.top + size.height, 0);
          const page = Math.max(
            1,
            Math.floor(shown / Math.max(1, event.currentTarget.offsetHeight))
          );
          const move = {
            ArrowDown: event.metaKey ? rows.length - 1 : index + 1,
            ArrowUp: event.metaKey ? 0 : index - 1,
            PageDown: index + page,
            PageUp: index - page,
            Home: 0,
            End: rows.length - 1,
          }[event.key];
          if (move !== undefined && !event.shiftKey) {
            event.preventDefault();
            focusRow(move);
          } else if (event.key === ' ') {
            // Selects the row, Shift from the last one ticked, as its checkbox does; and the browser would scroll a
            // page and leave the focused row behind.
            event.preventDefault();
            if (
              selectionModel !== null &&
              !event.repeat &&
              selectionModel.selectableSet.has(row.id)
            )
              selectRows(
                selectionModel,
                row.id,
                !selectionModel.selected.has(row.id),
                event.shiftKey
              );
          } else if (event.key === 'Enter' && !event.repeat)
            onRowClick(row.original, event);
        },
      })}
      {...(virtual !== undefined && {
        'data-index': index,
        ref: measureRow,
        // The header rows come first, and `aria-rowindex` starts at 1.
        'aria-rowindex': headerGroups.length + index + 1,
      })}
    >
      {row.getAllCells().map((cell) => {
        const layout = layoutOf(cell.column.columnDef, cell.column.id);
        const pin = pinOf(cell.column.id);
        return (
          <TableCell
            key={cell.id}
            sticky={pin === undefined ? layout.sticky : 'start'}
            pinEdge={pin?.edge ?? false}
            {...(pin !== undefined && {
              style: {
                '--pin-start': `${pin.start}px`,
              } as React.CSSProperties,
            })}
            shrink={layout.shrink}
            align={layout.align}
            // The cell of the checkbox selects, it does not open the row.
            {...(cell.column.id === selectColumnId && {
              'data-row-click-ignore': true,
            })}
          >
            <table.FlexRender cell={cell} />
          </TableCell>
        );
      })}
    </TableRow>
  );

  // As tall as its rows, up to the height its parent gives it (a column of flex with a height, the table not told to
  // grow): past it, the rows scroll in its own viewport. To fill the height whatever the rows, give it `flex-1`. The
  // header stays in the table to keep its columns, its cells sticky (a table does not keep a sticky section above its
  // rows); the footer, one cell wide, sits below the scroll area, so the scrollbar runs along the rows only.
  return (
    <SelectionContext value={selectionModel}>
      <div
        data-slot="data-table"
        // A column held at the end draws its own edge: the shade of the end would darken it.
        data-sticky-end={hasStickyEnd || undefined}
        className={cn(
          'group/table flex min-h-0 flex-col overflow-hidden rounded-lg border bg-surface',
          className
        )}
        {...props}
      >
        {/* The table's own variables sit here, not on its root, whose `style` is the app's (a height). */}
        <ScrollAreaPrimitive.Root
          style={
            {
              '--header-height': `${size.height}px`,
              // The viewport less the padding of a cell; `auto` until measured (the server knows no width), so the
              // empty slot spans its cell meanwhile.
              '--empty-width':
                size.width > 0
                  ? `calc(${size.width}px - var(--spacing) * 6)`
                  : 'auto',
            } as React.CSSProperties
          }
          className="group/scroll relative flex min-h-0 flex-1 flex-col"
        >
          <ScrollAreaPrimitive.Viewport
            ref={viewport}
            data-slot="data-table-viewport"
            // The horizontal scrollbar overlays the rows: its height (h-2.5) is kept free below the last one. No
            // rubber band at the edges: it would drag the sticky header off the rows, and a horizontal one would swipe
            // back in history. A table with nothing to scroll still lets the page scroll under the wheel.
            className="size-full scroll-pt-(--header-height) overscroll-x-none outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-has-overflow-x:pb-2.5 data-has-overflow-y:overscroll-y-none"
          >
            {/* Watched for its size: rows that come or go (a search, a page) update the scrollbars and the shades. */}
            <ScrollAreaPrimitive.Content>
              <Table
                aria-label={label}
                // Assistive tech counts the rows in the DOM: with only those in view there, it is told how many there are.
                // With no row, the empty slot is a row of its own: the count is left to the DOM.
                aria-rowcount={
                  virtual === undefined || rows.length === 0
                    ? undefined
                    : headerGroups.length + rows.length
                }
              >
                {/* Sticky as a whole: its rows, as many as the groups of columns are deep, stay stacked. */}
                <TableHeader ref={head} sticky>
                  {headerGroups.map((group, depth) => (
                    <TableRow
                      key={group.id}
                      aria-rowindex={
                        virtual === undefined ? undefined : depth + 1
                      }
                    >
                      {/* A column shallower than the others spans the rows above it, from its topmost header down. */}
                      {group.headers
                        .filter((header) => header.rowSpan > 0)
                        .map((header) => {
                          const spansColumns = header.column.columns.length > 0;
                          const layout = layoutOf(
                            header.column.columnDef,
                            header.column.id
                          );
                          const pin = spansColumns
                            ? undefined
                            : pinOf(header.column.id);
                          return (
                            <TableHead
                              key={header.id}
                              {...(pin !== undefined && {
                                ref: pinHead(header.column.id),
                              })}
                              pinEdge={pin?.edge ?? false}
                              colSpan={header.colSpan}
                              rowSpan={
                                header.rowSpan > 1 ? header.rowSpan : undefined
                              }
                              scope={spansColumns ? 'colgroup' : 'col'}
                              // Chromium exposes a header of scope `colgroup` as a cell.
                              role="columnheader"
                              aria-sort={
                                sorting?.column === header.column.id
                                  ? ariaSort[sorting.direction]
                                  : undefined
                              }
                              sticky={
                                pin === undefined ? layout.sticky : 'start'
                              }
                              shrink={layout.shrink}
                              align={layout.align}
                              spans={spansColumns}
                              style={
                                {
                                  '--column-size':
                                    layout.size === undefined
                                      ? 'auto'
                                      : `${layout.size}px`,
                                  '--pin-start': `${pin?.start ?? 0}px`,
                                } as React.CSSProperties
                              }
                              // A width given to a column holds from one page to the next, at least.
                              {...(layout.size !== undefined &&
                                !spansColumns && {
                                  className:
                                    'w-(--column-size) min-w-(--column-size)',
                                })}
                            >
                              {isTitled(header.column.columnDef) ? (
                                <TitledHeader
                                  column={header.column.columnDef}
                                  table={
                                    headers as DataTableHeaders | undefined
                                  }
                                />
                              ) : (
                                <table.FlexRender header={header} />
                              )}
                            </TableHead>
                          );
                        })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody aria-busy={busy || undefined}>
                  {rows.length === 0 ? (
                    <TableRow hoverable={false}>
                      <TableCell colSpan={columnCount}>
                        {/* As wide as the viewport and held at its start: a table wider than the screen keeps it in view. */}
                        <div
                          ref={keepFocusInTable}
                          className="sticky start-3 w-(--empty-width) max-w-full wrap-anywhere whitespace-normal"
                        >
                          {empty}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : virtual === undefined ? (
                    rows.map((row, index) => renderRow(row, index))
                  ) : (
                    <>
                      {/* Rows out of view are left out; two empty rows keep their height, so the scrollbar stays true. */}
                      <tr
                        aria-hidden="true"
                        style={
                          {
                            '--row-height': `${items[0]?.start ?? 0}px`,
                          } as React.CSSProperties
                        }
                        className="h-(--row-height)"
                      />
                      {items.map((item) => {
                        const row = rows[item.index];
                        return row === undefined
                          ? null
                          : renderRow(row, item.index);
                      })}
                      <tr
                        aria-hidden="true"
                        style={
                          {
                            '--row-height': `${virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0)}px`,
                          } as React.CSSProperties
                        }
                        className="h-(--row-height)"
                      />
                    </>
                  )}
                </TableBody>
              </Table>
            </ScrollAreaPrimitive.Content>
          </ScrollAreaPrimitive.Viewport>
          {/* The track starts below the header, a padding Base UI counts when it sizes the thumb. */}
          <ScrollBar autoHide className="pt-(--header-height)" />
          {/* A scrollbar that shows on hover only says nothing of the columns past the edge: a shade does. */}
          <div
            aria-hidden="true"
            data-slot="data-table-overflow-start"
            className="pointer-events-none absolute inset-y-0 start-0 z-20 w-6 from-shade to-transparent opacity-0 transition-opacity group-data-overflow-x-start/scroll:opacity-100 motion-reduce:transition-none ltr:bg-linear-to-r rtl:bg-linear-to-l"
          />
          <div
            aria-hidden="true"
            data-slot="data-table-overflow-end"
            className="pointer-events-none absolute inset-y-0 end-0 z-20 w-6 from-shade to-transparent opacity-0 transition-opacity group-data-overflow-x-end/scroll:opacity-100 group-data-sticky-end/table:hidden motion-reduce:transition-none ltr:bg-linear-to-l rtl:bg-linear-to-r"
          />
          <ScrollBar orientation="horizontal" className="z-20" />
          <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
        {onRowClick !== undefined && (
          <span id={hintId} hidden>
            {selectionModel === null
              ? t('components:dataTable.rowHint')
              : t('components:dataTable.rowHintSelectable')}
          </span>
        )}
        {/* One region per message: a region is read whole when it changes, so a sorting would be read again with
            every empty result after it. */}
        <span role="status" className="sr-only">
          {sortMessage}
        </span>
        <span role="status" className="sr-only">
          {emptyMessage}
        </span>
        {footer !== undefined && (
          <div
            data-slot="data-table-footer"
            className="@container border-t bg-muted/50 px-3 py-2 text-sm"
          >
            {footer}
          </div>
        )}
      </div>
    </SelectionContext>
  );
}
