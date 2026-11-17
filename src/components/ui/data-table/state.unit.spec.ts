import { describe, expect, it } from 'vitest';

import {
  type DataTableHistory,
  dataTableState,
  type DataTableStore,
  isEmptyValue,
} from '@/components/ui/data-table/state';

type State = {
  readonly page?: number;
  readonly size?: number;
  readonly q?: string;
  readonly orderBy?: 'name' | 'createdAt';
  readonly dir?: 'asc' | 'desc';
  readonly status?: 'active' | 'invited';
  readonly tags?: ReadonlyArray<string>;
  readonly total?: { readonly min?: number; readonly max?: number };
  readonly ids?: ReadonlySet<string>;
  readonly hidden?: ReadonlyArray<string>;
};

const defaults = { column: 'name', direction: 'asc' } as const;

const memoryStore = (initial: State, { addresses = true } = {}) => {
  const updates: Array<{ state: State; replace: boolean }> = [];
  let current = initial;
  const store: DataTableStore<State> = {
    get state() {
      return current;
    },
    update: (next, options) => {
      current = next(current);
      updates.push({ state: current, replace: options?.replace ?? false });
    },
    ...(addresses && {
      link: (next: (state: State) => State) => ({
        href: JSON.stringify(next(initial)),
        onClick: () => {},
      }),
    }),
  };
  const table = dataTableState(store, defaults, {
    filterKeys: ['status', 'tags', 'total', 'ids'],
  });
  return {
    table,
    updates,
    /** Another state arrives from outside, as on Back. */
    arrive: (state: State) => {
      current = state;
    },
  };
};

describe('dataTableState', () => {
  it('answers the sorting of the state, or the default', () => {
    expect(memoryStore({}).table.sorting).toEqual(defaults);
    expect(memoryStore({ orderBy: 'createdAt' }).table.sorting).toEqual({
      column: 'createdAt',
      direction: 'asc',
    });
  });

  it('sorts from the first page, and leaves the default sorting out of the state', () => {
    const { table, updates } = memoryStore({ page: 3, status: 'active' });

    table.sort({ column: 'createdAt', direction: 'desc' });
    table.sort(defaults);

    expect(updates.map((update) => update.state)).toEqual([
      { status: 'active', orderBy: 'createdAt', dir: 'desc' },
      { status: 'active' },
    ]);
  });

  it('gives a column header its sorting, and sorts by its column', () => {
    const { table, updates } = memoryStore({
      orderBy: 'createdAt',
      dir: 'desc',
    });

    expect(table.sortHeader('createdAt').sorted).toBe('desc');
    expect(table.sortHeader('name').sorted).toBeUndefined();
    table.sortHeader('name').onSort('desc');

    expect(updates.map((update) => update.state)).toEqual([
      { orderBy: 'name', dir: 'desc' },
    ]);
  });

  it('links to a page, keeping the rest of the state, with no page for the first', () => {
    const { table } = memoryStore({ page: 2, status: 'active' });

    expect(table.page).toBe(2);
    expect(JSON.parse(table.pageLink(3)?.href ?? '')).toEqual({
      page: 3,
      status: 'active',
    });
    expect(JSON.parse(table.pageLink(1)?.href ?? '')).toEqual({
      status: 'active',
    });
    expect(memoryStore({}).table.page).toBe(1);
  });

  it('has no page links without addresses, and goes to a page all the same', () => {
    const { table, updates } = memoryStore(
      { page: 3, status: 'active' },
      { addresses: false }
    );

    expect(table.pageLink(2)).toBeUndefined();
    table.goToPage(2);
    table.goToPage(1);

    expect(updates.map((update) => update.state)).toEqual([
      { page: 2, status: 'active' },
      { status: 'active' },
    ]);
  });

  it('searches from the first page, in one history entry for the whole search, and drops an empty text', () => {
    const { table, updates } = memoryStore({ page: 2, q: 'ada' });

    table.searchText('grace');
    table.searchText('grace h');
    table.searchText('');

    expect(updates).toEqual([
      { state: { q: 'grace' }, replace: false },
      { state: { q: 'grace h' }, replace: true },
      { state: {}, replace: true },
    ]);
  });

  it('starts a new history entry once the field is no longer as the table left it', () => {
    const { table, updates, arrive } = memoryStore({});

    table.searchText('grace');
    arrive({});
    table.searchText('ada');
    table.filter('status', 'active');
    table.filter('tags', ['vip']);
    table.filter('tags', ['vip', 'beta']);

    expect(updates.map((update) => update.replace)).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it('pushes a change that follows a move the table did not make, such as a page link', () => {
    const { table, updates, arrive } = memoryStore({});

    table.filter('status', 'active');
    arrive({ status: 'active', page: 2 });
    table.filter('status', 'invited');

    expect(updates.map((update) => update.replace)).toEqual([false, false]);
  });

  it('does not write a value the state already holds', () => {
    const { table, updates } = memoryStore({
      status: 'active',
      total: { min: 10 },
      q: 'ada',
    });

    table.filter('status', 'active');
    table.filter('total', { min: 10 });
    table.searchText('ada');

    expect(updates).toEqual([]);
  });

  it('says whether the search or a filter narrows the rows, and resets them but the sorting', () => {
    expect(
      memoryStore({ orderBy: 'createdAt', page: 2 }).table.isFiltered
    ).toBe(false);
    expect(memoryStore({ total: {} }).table.isFiltered).toBe(false);
    const { table, updates } = memoryStore({
      orderBy: 'createdAt',
      page: 2,
      q: 'ada',
      status: 'active',
      total: { min: 10 },
    });

    expect(table.isFiltered).toBe(true);
    table.reset();

    expect(updates).toEqual([
      { state: { orderBy: 'createdAt' }, replace: false },
    ]);
  });

  it('drops a range with neither end, as an empty filter', () => {
    const { table, updates } = memoryStore({ total: { min: 10 } });

    table.filter('total', {});

    expect(updates.map((update) => update.state)).toEqual([{}]);
    expect(isEmptyValue({ min: undefined })).toBe(true);
    expect(isEmptyValue({ min: 0 })).toBe(false);
    expect(isEmptyValue(new Date(0))).toBe(false);
    expect(isEmptyValue({ from: new Date(0) })).toBe(false);
    expect(isEmptyValue({ from: undefined, to: undefined })).toBe(true);
    expect(isEmptyValue(new Set())).toBe(true);
    expect(isEmptyValue(new Set(['a']))).toBe(false);
  });

  it('writes a set whose members change', () => {
    const { table, updates } = memoryStore({ ids: new Set(['a']) });

    table.filter('ids', new Set(['a', 'b']));
    table.filter('ids', new Set(['b', 'a']));

    expect(updates.map((update) => Array.from(update.state.ids ?? []))).toEqual(
      [['a', 'b']]
    );
  });

  it('filters from the first page, and drops a filter with no value', () => {
    const { table, updates } = memoryStore({ page: 2, tags: ['vip'] });

    table.filter('status', 'invited');
    table.filter('tags', []);
    table.filter('status', undefined);

    expect(updates.map((update) => update.state)).toEqual([
      { tags: ['vip'], status: 'invited' },
      { status: 'invited' },
      {},
    ]);
  });
});

describe('dataTableState page size', () => {
  it('answers the size of the state, or the default', () => {
    expect(memoryStore({}).table.pageSize).toBe(10);
    expect(memoryStore({ size: 25 }).table.pageSize).toBe(25);
  });

  it('changes the size and goes back to the first page, leaving the default out', () => {
    const { table, updates } = memoryStore({ page: 3, status: 'active' });

    table.setPageSize(50);
    expect(updates.at(-1)?.state).toEqual({ status: 'active', size: 50 });

    table.setPageSize(10);
    expect(updates.at(-1)?.state).toEqual({ status: 'active' });
  });
});

describe('dataTableState filtersKey', () => {
  it('changes with the search or a filter, not with the page, the sorting or the size', () => {
    const key = (state: State) => memoryStore(state).table.filtersKey;
    const base = key({ q: 'ada', status: 'active' });

    expect(key({ q: 'ada', status: 'active', page: 2, size: 50 })).toBe(base);
    expect(key({ q: 'ada', status: 'active', orderBy: 'createdAt' })).toBe(
      base
    );
    expect(key({ q: 'alan', status: 'active' })).not.toBe(base);
    expect(key({ q: 'ada', status: 'invited' })).not.toBe(base);
  });
});

describe('dataTableState history with a store that lags', () => {
  // A router: `state` is the one it shows, which lags behind the changes it has taken, applied to its newest state.
  const laggingStore = () => {
    const updates: Array<{ state: State; replace: boolean }> = [];
    let shown: State = {};
    let newest: State = {};
    const store: DataTableStore<State> = {
      get state() {
        return shown;
      },
      update: (next, options) => {
        newest = next(newest);
        updates.push({ state: newest, replace: options?.replace ?? false });
      },
    };
    const history: DataTableHistory = { current: null };
    return {
      updates,
      /** A render: the table as the store shows it now. */
      table: () => dataTableState(store, defaults, { history }),
      /** The store shows the newest state at last. */
      land: () => {
        shown = newest;
      },
    };
  };

  it('shows and hides columns in one history entry, though the store has not shown the first change yet', () => {
    const { table, updates, land } = laggingStore();

    table().setColumnVisible('name', false);
    table().setColumnVisible('total', false);
    land();
    table();
    table().setColumnVisible('name', true);

    expect(updates).toEqual([
      { state: { hidden: ['name'] }, replace: false },
      { state: { hidden: ['name', 'total'] }, replace: true },
      { state: { hidden: ['total'] }, replace: true },
    ]);
  });

  it('pushes a column toggle that follows another change', () => {
    const { table, updates } = laggingStore();

    table().sort({ column: 'createdAt', direction: 'desc' });
    table().setColumnVisible('name', false);

    expect(updates.map((update) => update.replace)).toEqual([false, false]);
  });
});

describe('dataTableState columns and sorting', () => {
  it('drops the sorting with the column it sorts by, and goes back to the first page, in the same entry', () => {
    const { table, updates } = memoryStore({
      page: 2,
      orderBy: 'createdAt',
      dir: 'desc',
    });

    table.setColumnVisible('createdAt', false);

    expect(updates).toEqual([
      { state: { hidden: ['createdAt'] }, replace: false },
    ]);
  });

  it('keeps the sorting and the page when the default column hides', () => {
    const { table, updates } = memoryStore({
      orderBy: 'name',
      dir: 'desc',
      page: 2,
    });

    table.setColumnVisible('name', false);

    expect(updates.map((update) => update.state)).toEqual([
      { orderBy: 'name', dir: 'desc', page: 2, hidden: ['name'] },
    ]);
  });

  it('shows the column it sorts by: a URL hiding every column can be sorted all the same', () => {
    const { table, updates } = memoryStore({
      hidden: ['name', 'createdAt'],
    });

    table.sort({ column: 'createdAt', direction: 'desc' });

    expect(updates.map((update) => update.state)).toEqual([
      { hidden: ['name'], orderBy: 'createdAt', dir: 'desc' },
    ]);
  });

  it('keeps the sorting when another column hides', () => {
    const { table, updates } = memoryStore({ orderBy: 'createdAt' });

    table.setColumnVisible('name', false);

    expect(updates.map((update) => update.state)).toEqual([
      { orderBy: 'createdAt', hidden: ['name'] },
    ]);
  });
});

describe('dataTableState history with a store that holds more than the table', () => {
  it('merges a search typed in a row, though the store hands `next` keys of another route', () => {
    const updates: Array<{ state: State; replace: boolean }> = [];
    // The URL holds a key of a child route; the table's state, what its route validated, does not.
    let url: State & { readonly userId?: string } = { userId: '7' };
    const store: DataTableStore<State> = {
      get state() {
        const { userId: _userId, ...state } = url;
        return state;
      },
      update: (next, options) => {
        url = next(url);
        updates.push({ state: url, replace: options?.replace ?? false });
      },
    };
    const history: DataTableHistory = { current: null };
    const table = () => dataTableState(store, defaults, { history });

    table().searchText('a');
    table().searchText('ad');
    table().searchText('ada');

    expect(updates.map((update) => update.replace)).toEqual([
      false,
      true,
      true,
    ]);
    expect(updates.at(-1)?.state).toEqual({ userId: '7', q: 'ada' });
  });
});

describe('dataTableState history origin', () => {
  it('pushes the change of a run that brings the field back to where the run started, so Back finds the run', () => {
    const { table, updates } = memoryStore({});

    table.searchText('a');
    table.searchText('ab');
    table.searchText('abc');
    table.searchText('');

    expect(updates).toEqual([
      { state: { q: 'a' }, replace: false },
      { state: { q: 'ab' }, replace: true },
      { state: { q: 'abc' }, replace: true },
      { state: {}, replace: false },
    ]);
  });
});

describe('dataTableState sorting by a hidden column', () => {
  it('sorts by the default when the URL sorts by a column it hides, and leaves that sorting out of the state', () => {
    const { table } = memoryStore({
      orderBy: 'createdAt',
      dir: 'desc',
      hidden: ['createdAt'],
    });

    expect(table.sorting).toEqual(defaults);
    expect(table.state).toEqual({ hidden: ['createdAt'] });
  });

  it('keeps the sorting of the default column, though hidden', () => {
    const { table } = memoryStore({
      orderBy: 'name',
      dir: 'desc',
      hidden: ['name'],
    });

    expect(table.sorting).toEqual({ column: 'name', direction: 'desc' });
  });
});

describe('dataTableState filtersKey and empty filters', () => {
  it('gives an empty filter the key of no filter', () => {
    const key = (state: State) => memoryStore(state).table.filtersKey;

    expect(key({ tags: [] })).toBe(key({}));
    expect(key({ total: {} })).toBe(key({}));
    expect(key({ tags: ['vip'] })).not.toBe(key({}));
  });
});

describe('dataTableState rowsKey and empty filters', () => {
  it('gives an empty filter the key of no filter', () => {
    const key = (state: State) => memoryStore(state).table.rowsKey;

    expect(key({ tags: [] })).toBe(key({}));
    expect(key({ status: '' as 'active' })).toBe(key({}));
    expect(key({ status: 'active' })).not.toBe(key({}));
  });
});
