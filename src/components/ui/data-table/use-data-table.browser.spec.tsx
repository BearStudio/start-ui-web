import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { selectFilter } from '@/components/ui/data-table/filters/select-filter';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import type { DataTableStore } from '@/components/ui/data-table/state';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

import { render } from '@/tests/utils';

type State = {
  readonly page?: number | undefined;
  readonly q?: string | undefined;
  readonly orderBy?: 'name' | undefined;
  readonly dir?: 'asc' | 'desc' | undefined;
};

function useMemoryStore<S extends State>(): DataTableStore<S> {
  const [state, setState] = useState({} as S);
  return { state, update: (next) => setState(next) };
}

function LocalTable() {
  const store = useMemoryStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  return (
    <>
      <DataTableToolbar table={table} search={{ 'aria-label': 'Search' }} />
      <output aria-label="State">{JSON.stringify(table.state)}</output>
      {/* The footer of a table, wide enough for every page. */}
      <div className="@container">
        <DataTablePagination table={table} pages={3} aria-label="Pages" />
      </div>
    </>
  );
}

const pages = () => page.getByRole('navigation', { name: 'Pages' });
const state = () => page.getByRole('status', { name: 'State' });

describe('useDataTable with a store that has no addresses', () => {
  it('pages with buttons, since memory has no addresses', async () => {
    await render(<LocalTable />);

    expect(pages().getByRole('link').elements()).toHaveLength(0);
    await pages().getByRole('button', { name: 'Page 2' }).click();

    await expect.element(state()).toHaveTextContent('{"page":2}');
    await expect
      .element(pages().getByRole('button', { name: 'Page 2' }))
      .toHaveAttribute('aria-current', 'page');
    await expect
      .element(pages().getByRole('button', { name: 'Previous' }))
      .toBeEnabled();
  });

  it('searches from the first page', async () => {
    await render(<LocalTable />);
    await pages().getByRole('button', { name: 'Page 3' }).click();

    await page.getByRole('textbox', { name: 'Search' }).fill('ada');

    await expect.element(state()).toHaveTextContent('{"q":"ada"}');
    await expect
      .element(pages().getByRole('button', { name: 'Next' }))
      .toBeEnabled();
  });
});

// Checked by the compiler, never run: each `@ts-expect-error` fails the typecheck once its line compiles.
export const typing = (
  store: DataTableStore<
    State & { readonly role?: 'admin' | 'user' | undefined }
  >
) => {
  const admin = selectFilter({
    title: 'Role',
    options: [{ value: 'admin', label: 'Admin' }],
  });
  const loose = selectFilter({
    title: 'Role',
    options: [{ value: 'admin' as string, label: 'Admin' }],
  });
  return () => [
    // A filter may offer part of a field's values.
    useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
      filters: { role: admin },
    }),
    useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
      // @ts-expect-error -- the state has no field `team`.
      filters: { team: admin },
    }),
    useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
      // @ts-expect-error -- `q` is the search, not a filter.
      filters: { q: admin },
    }),
    useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
      // @ts-expect-error -- a filter that may write any text does not fit a field of two values.
      filters: { role: loose },
    }),
    useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
    }).filter(
      // @ts-expect-error -- the table has no filter for the role, a field of its state all the same.
      'role',
      'admin'
    ),
  ];
};
