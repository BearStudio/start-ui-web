import * as React from 'react';

import {
  type AnyDataTableFilter,
  type DataTableFilter,
  isFilterEmpty,
} from '@/components/ui/data-table/filters/filter';
import { useAddedFilters } from '@/components/ui/data-table/filters/use-added-filters';
import {
  type DataTableFilterKey,
  type DataTableFilterUpdate,
  type DataTableHistory,
  type DataTableSorting,
  dataTableState,
  type DataTableStateValue,
  type DataTableStore,
} from '@/components/ui/data-table/state';

/**
 * The filters a state can have: for each of its filter fields, a filter that reads all the field may hold and
 * writes only what it accepts.
 */
export type DataTableFiltersOf<S extends DataTableStateValue> = {
  readonly [Key in DataTableFilterKey<S>]?: DataTableFilter<
    NonNullable<S[Key]>,
    NonNullable<S[Key]>
  >;
};

/** A filter shown above the table: what `DataTableFilterChip` takes. */
export type DataTableChipModel = {
  readonly key: string;
  readonly filter: AnyDataTableFilter;
  readonly value: unknown;
  readonly onValueChange: (value: DataTableFilterUpdate<unknown>) => void;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onRemove: () => void;
};

/** What `DataTableToolbar` renders, whatever the state and the filters of the table. */
export type DataTableToolbarModel = {
  readonly search: string;
  readonly onSearch: (text: string) => void;
  readonly searchRef: React.RefObject<HTMLInputElement | null>;
  /** Tells the table whether its toolbar shows a search, which a column header then offers as its filter. */
  readonly onSearchShown: (shown: boolean) => void;
  /** Counts the filters asked for from a column header: the toolbar shows its controls again for each. */
  readonly revealRequests: number;
  readonly attachAddFilter: (button: HTMLButtonElement | null) => void;
  /** The filters not shown yet, which "Add filter" offers. */
  readonly addable: ReadonlyArray<{
    readonly key: string;
    readonly title: string;
  }>;
  readonly onAdd: (key: string) => void;
  /** The filters shown, in the order of `filters`. */
  readonly chips: ReadonlyArray<DataTableChipModel>;
};

/**
 * A table whose page, search, sorting, and filters live in `store`, which the app provides through an adapter:
 * memory, the URL through a router. Each filter is typed by the field of the state it fills, and a filter for a
 * field the state lacks does not compile.
 *
 * Answers what the parts of the table take: `DataTableToolbar` and `DataTable` take it whole, `DataTablePagination`
 * as `table`; `state` is what the rows depend on.
 */
export function useDataTable<
  S extends DataTableStateValue,
  const Filters extends DataTableFiltersOf<S> = Record<never, never>,
>({
  store,
  defaultSorting,
  defaultPageSize,
  filters: given,
}: {
  store: DataTableStore<S>;
  defaultSorting: DataTableSorting<NonNullable<S['orderBy']>>;
  /** How many rows a page holds while the state does not say (`size`). Defaults to 10. */
  defaultPageSize?: number;
  filters?: Filters &
    Record<Exclude<keyof Filters, DataTableFilterKey<S>>, never>;
}) {
  type Key = keyof Filters & DataTableFilterKey<S>;
  const filters: Filters = given ?? ({} as Filters);
  const isKey = (key: string): key is Key => Object.hasOwn(filters, key);
  const keys = Object.keys(filters).filter(isKey);
  const filterOf = (key: Key) => filters[key] as AnyDataTableFilter;
  const [history] = React.useState<DataTableHistory>(() => ({
    current: null,
  }));
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const [addFilterButton, setAddFilterButton] =
    React.useState<HTMLButtonElement | null>(null);
  const [focusRequests, setFocusRequests] = React.useState(0);
  const [hasSearch, setHasSearch] = React.useState(false);
  const [revealRequests, setRevealRequests] = React.useState(0);
  const [searchFocusRequests, setSearchFocusRequests] = React.useState(0);
  const focusPending = React.useRef(false);

  const state = dataTableState(store, defaultSorting, {
    filterKeys: keys,
    // A key no longer among `filters` (the map changed while the table stays) filters nothing.
    isEmpty: (key, value) => !isKey(key) || isFilterEmpty(filterOf(key), value),
    history,
    ...(defaultPageSize !== undefined && { defaultPageSize }),
  });
  const added = useAddedFilters(
    (key: Key) => isKey(key) && !isFilterEmpty(filterOf(key), store.state[key])
  );

  // "Add filter" may come back only a render after the last filter shown goes: the request waits for it.
  React.useEffect(() => {
    if (
      focusRequests === 0 ||
      !focusPending.current ||
      addFilterButton === null
    )
      return;
    focusPending.current = false;
    addFilterButton.focus();
  }, [focusRequests, addFilterButton]);
  // `select`, for the Filter of a column header: typing replaces the search. After a removal, the search keeps its text.
  const focusSearch = (select = false) => {
    searchRef.current?.focus();
    if (select) searchRef.current?.select();
  };
  const focusSearchEvent = React.useEffectEvent(() => focusSearch(true));
  React.useEffect(() => {
    if (searchFocusRequests === 0) return;
    focusSearchEvent();
  }, [searchFocusRequests]);
  // After a removal or a reset, the button that had the focus is gone: the search takes it, or in a table with no
  // search, "Add filter".
  const moveFocus = () => {
    if (searchRef.current !== null) return focusSearch();
    focusPending.current = true;
    setFocusRequests((requests) => requests + 1);
  };

  const toolbar: DataTableToolbarModel = {
    search: store.state.q ?? '',
    // A search of blanks is no search; the text keeps its spaces while the user types.
    onSearch: (text) => state.searchText(text.trim() === '' ? '' : text),
    searchRef,
    attachAddFilter: setAddFilterButton,
    addable: keys
      .filter((key) => !added.isShown(key))
      .map((key) => ({ key, title: filterOf(key).title })),
    onAdd: (key) => {
      if (isKey(key)) added.add(key);
    },
    onSearchShown: setHasSearch,
    revealRequests,
    chips: keys
      .filter((key) => added.isShown(key))
      .map((key) => {
        const filter = filterOf(key);
        return {
          key,
          filter,
          value: store.state[key],
          onValueChange: (update) => {
            // Emptied from its editor, a filter keeps its chip; its remove button takes it away. Kept at once, so
            // the chip stays while the store applies the change; let go once the store wrote a value after all.
            added.keep(key);
            state.filter(
              key,
              update as DataTableFilterUpdate<S[Key]>,
              (value) => {
                if (!isFilterEmpty(filter, value)) added.release(key);
              }
            );
          },
          open: added.isOpen(key),
          onOpenChange: (open) => added.setOpen(key, open),
          onRemove: () => {
            added.remove(key);
            moveFocus();
            state.filter(key, undefined);
          },
        };
      }),
  };

  return {
    ...state,
    /** Sets the value of a filter of the table; a field of the state with no filter is not one. */
    filter: <FilterKey extends Key>(
      key: FilterKey,
      value: DataTableFilterUpdate<S[FilterKey]>
    ) => state.filter(key, value),
    /** Shows and opens a filter, or focuses the search: what the Filter item of a column header asks for. */
    openFilter: (target: Key | 'search') => {
      setRevealRequests((requests) => requests + 1);
      // The search may be hidden behind the bar of a selection until the toolbar shows again: it takes the focus once
      // it does.
      if (target === 'search')
        setSearchFocusRequests((requests) => requests + 1);
      else added.add(target);
    },
    /** Whether a column header can offer `target` as its filter: the search only once the toolbar shows one. */
    canFilter: (target: Key | 'search') =>
      target === 'search' ? hasSearch : isKey(target),
    reset: () => {
      added.clear();
      state.reset();
      moveFocus();
    },
    toolbar,
  };
}

/** What `useDataTable` answers for the state `S` and the filters `Filters`. */
export type DataTableController<
  S extends DataTableStateValue,
  Filters extends DataTableFiltersOf<S> = Record<never, never>,
> = ReturnType<typeof useDataTable<S, Filters>>;
