import { DirectionProvider } from '@base-ui/react/direction-provider';
import i18next from 'i18next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Card } from '@/components/ui/card';
import {
  DataTable,
  type DataTableColumn,
  type DataTableColumnFor,
  type DataTableHeaders,
} from '@/components/ui/data-table/data-table';
import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import {
  DataTableEmptyState,
  DataTableErrorState,
  DataTableLoadingState,
} from '@/components/ui/data-table/states';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

import { render } from '@/tests/utils';

const columnsOf = (
  count: number
): ReadonlyArray<DataTableColumn<{ id: string }>> =>
  Array.from({ length: count }, (_, i) => ({
    id: `column-${i}`,
    header: `A rather long header ${i}`,
    cell: () => 'value',
  }));

const slot = (name: string) => {
  const element = document.querySelector(`[data-slot=${name}]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No ${name}.`);
  return element;
};

/** The live regions of the table: the first says its sorting, the second what its empty slot shows. */
const regions = () => {
  const found = [
    ...slot('data-table').querySelectorAll<HTMLElement>('[role=status]'),
  ];
  const [sorting, empty] = found;
  if (found.length !== 2 || sorting === undefined || empty === undefined)
    throw new Error(`${found.length} live regions.`);
  return { sorting, empty };
};
/** What a live region says, as it is: no matcher folding its spaces. */
const sortSaid = () => regions().sorting.textContent;
const emptySaid = () => regions().empty.textContent;

const setup = async (columns: number, rows = 1) => {
  await render(
    <div className="flex h-75 w-100 flex-col">
      <DataTable
        columns={columnsOf(columns)}
        data={Array.from({ length: rows }, (_, i) => ({ id: String(i) }))}
      />
    </div>
  );
  await expect.element(page.getByRole('table')).toBeVisible();
  return {
    viewport: slot('data-table-viewport'),
    shown: (name: 'start' | 'end') =>
      getComputedStyle(slot(`data-table-overflow-${name}`)).opacity,
  };
};

describe('DataTable', () => {
  it('shades the edge past which columns are hidden, and moves the shade as it scrolls', async () => {
    const { viewport, shown } = await setup(8);

    await expect.poll(() => shown('end')).toBe('1');
    expect(shown('start')).toBe('0');

    // Scrolled to the end again on each try: the columns may still widen as the font loads.
    const toEnd = () => {
      viewport.scrollLeft = viewport.scrollWidth;
    };
    await expect.poll(() => (toEnd(), shown('start'))).toBe('1');
    await expect.poll(() => (toEnd(), shown('end'))).toBe('0');
  });

  it('shades no edge when every column fits', async () => {
    const { shown } = await setup(1);

    await expect.poll(() => shown('end')).toBe('0');
    expect(shown('start')).toBe('0');
  });

  it('keeps the last row above the horizontal scrollbar once scrolled to the bottom', async () => {
    const { viewport } = await setup(8, 30);
    const scrollbar = document.querySelector(
      '[data-slot=scroll-area-scrollbar][data-orientation=horizontal]'
    );
    if (!(scrollbar instanceof HTMLElement))
      throw new Error('No horizontal scrollbar.');
    await expect
      .poll(() => scrollbar.getBoundingClientRect().height)
      .toBeGreaterThan(0);

    viewport.scrollTop = viewport.scrollHeight;

    const rows = page.getByRole('row').elements();
    const lastRow = rows.at(-1)?.getBoundingClientRect();
    expect(lastRow?.bottom).toBeLessThanOrEqual(
      scrollbar.getBoundingClientRect().top
    );
  });

  it('builds the header of a titled column: sorting, a shortcut to its filter, and what assistive tech hears', async () => {
    const onSort = vi.fn();
    const openFilter = vi.fn();
    const table: DataTableHeaders<'name', 'status'> = {
      sorting: { column: 'name', direction: 'asc' },
      sortHeader: (column) => ({
        sorted: 'asc',
        onSort: (direction) => onSort(column, direction),
      }),
      openFilter,
      // The toolbar shows no search: the header of Name offers none.
      canFilter: (target) => target !== 'search',
    };
    await render(
      <DataTable
        table={table}
        label="People"
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            title: 'Name',
            sortable: true,
            filter: 'search',
          },
          {
            id: 'status',
            accessorKey: 'status',
            title: 'Status',
            filter: 'status',
          },
          { id: 'note', accessorKey: 'note', title: 'Note' },
        ]}
        data={[{ name: 'Ada', status: 'active', note: '' }]}
      />
    );

    await expect
      .element(page.getByRole('table', { name: 'People' }))
      .toBeVisible();
    expect(
      page
        .getByRole('columnheader', { name: 'Name' })
        .element()
        .getAttribute('aria-sort')
    ).toBe('ascending');
    await page.getByRole('button', { name: 'Name' }).click();
    expect(
      page.getByRole('menuitem', { name: 'Filter' }).elements()
    ).toHaveLength(0);
    await page.getByRole('menuitemradio', { name: 'Descending' }).click();
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
    await expect.poll(() => page.getByRole('menu').elements()).toHaveLength(0);
    await page
      .getByRole('columnheader', { name: 'Status', exact: true })
      .getByRole('button')
      .click();
    expect(openFilter).toHaveBeenCalledWith('status');
    expect(page.getByRole('button', { name: 'Note' }).elements()).toHaveLength(
      0
    );
  });

  it("puts a group's header over its columns, a column outside it across both header rows, and a filter on the group", async () => {
    const onSort = vi.fn();
    const openFilter = vi.fn();
    const table: DataTableHeaders<'net', 'price'> = {
      sorting: { column: 'net', direction: 'desc' },
      sortHeader: (column) => ({
        sorted: 'desc',
        onSort: (direction) => onSort(column, direction),
      }),
      openFilter,
    };
    await render(
      <DataTable
        table={table}
        columns={[
          { id: 'name', accessorKey: 'name', title: 'Name' },
          {
            id: 'prices',
            title: 'Price',
            filter: 'price',
            columns: [
              {
                id: 'net',
                accessorKey: 'net',
                title: 'Excl. VAT',
                sortable: true,
              },
              { id: 'gross', accessorKey: 'gross', title: 'Incl. VAT' },
            ],
          },
        ]}
        data={[{ name: 'Desk', net: 100, gross: 120 }]}
      />
    );

    const group = page.getByRole('columnheader', { name: 'Price' }).element();
    expect([
      group.getAttribute('colspan'),
      group.getAttribute('scope'),
    ]).toEqual(['2', 'colgroup']);
    expect(
      page
        .getByRole('columnheader', { name: 'Name' })
        .element()
        .getAttribute('rowspan')
    ).toBe('2');
    expect(
      page
        .getByRole('columnheader', { name: 'Excl. VAT' })
        .element()
        .getAttribute('aria-sort')
    ).toBe('descending');
    await expect.element(page.getByRole('cell', { name: '120' })).toBeVisible();
    await page.getByRole('button', { name: 'Excl. VAT' }).click();
    await page.getByRole('menuitemradio', { name: 'Ascending' }).click();
    expect(onSort).toHaveBeenCalledWith('net', 'asc');
    await expect.poll(() => page.getByRole('menu').elements()).toHaveLength(0);
    await page
      .getByRole('columnheader', { name: 'Price', exact: true })
      .getByRole('button')
      .click();
    expect(openFilter).toHaveBeenCalledWith('price');
    expect(page.getByRole('menu').elements()).toHaveLength(0);
  });

  it('renders only the rows in view once virtual, and tells assistive tech where each one stands', async () => {
    const rowCount = 10_000;
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={Array.from({ length: rowCount }, (_, i) => ({
            name: `Row ${i}`,
          }))}
          label="Rows"
          virtual={{ rowHeight: 37 }}
        />
      </div>
    );

    await expect
      .element(page.getByRole('cell', { name: 'Row 0', exact: true }))
      .toBeVisible();
    expect(
      page.getByRole('table').element().getAttribute('aria-rowcount')
    ).toBe(String(rowCount + 1));
    expect(page.getByRole('row').elements().length).toBeLessThan(50);

    slot('data-table-viewport').scrollTop = slot(
      'data-table-viewport'
    ).scrollHeight;

    const last = page.getByRole('row', { name: `Row ${rowCount - 1}` });
    await expect.element(last).toBeVisible();
    expect(last.element().getAttribute('aria-rowindex')).toBe(
      String(rowCount + 1)
    );
    expect(
      page.getByRole('cell', { name: 'Row 0', exact: true }).elements()
    ).toHaveLength(0);
  });
});

type Person = {
  readonly name: string;
  readonly role: string;
  readonly team: string;
};
type People = {
  readonly orderBy?: 'name' | undefined;
  readonly role?: 'admin' | undefined;
  readonly team?: 'core' | undefined;
};

// Checked by the compiler, never run: each `@ts-expect-error` fails the typecheck once its line compiles.
export const columnTyping = (table: DataTableHeaders<'name', 'role'>) => {
  const columns: ReadonlyArray<DataTableColumnFor<Person, People, 'role'>> = [
    {
      id: 'name',
      accessorKey: 'name',
      title: 'Name',
      sortable: true,
      filter: 'search',
    },
    { id: 'role', accessorKey: 'role', title: 'Role', filter: 'role' },
  ];
  const team: DataTableColumnFor<Person, People, 'role'> = {
    id: 'team',
    title: 'Team',
    // @ts-expect-error -- the table has no filter on the team.
    filter: 'team',
  };
  // @ts-expect-error -- the state does not sort by the role.
  const role: DataTableColumnFor<Person, People, 'role'> = {
    id: 'role',
    title: 'Role',
    sortable: true,
  };
  const group: DataTableColumnFor<Person, People, 'role'> = {
    id: 'people',
    title: 'People',
    columns: [
      // @ts-expect-error -- a column of a group sorts only by what the state sorts by.
      { id: 'team', title: 'Team', sortable: true },
    ],
  };
  return [
    <DataTable key="table" table={table} columns={columns} data={[]} />,
    team,
    role,
    group,
  ];
};

describe('DataTable with onRowClick', () => {
  type Person = { id: string; name: string };
  const people: ReadonlyArray<Person> = [
    { id: 'p-1', name: 'Ada' },
    { id: 'p-2', name: 'Alan' },
  ];

  const setupClickable = async () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    const columns: ReadonlyArray<DataTableColumn<Person>> = [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      {
        id: 'actions',
        sticky: 'end',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <button type="button" onClick={() => onAction(row.original.id)}>
            Edit {row.original.name}
          </button>
        ),
      },
    ];
    await render(
      <DataTable
        columns={columns}
        data={people}
        label="People"
        getRowId={(person) => person.id}
        onRowClick={(person) => onRowClick(person.id)}
      />
    );
    return { onRowClick, onAction };
  };

  it('opens a row clicked anywhere, and from the keyboard with Enter', async () => {
    const { onRowClick } = await setupClickable();

    await page.getByRole('cell', { name: 'Alan', exact: true }).click();
    expect(onRowClick).toHaveBeenLastCalledWith('p-2');

    const firstRow = page.getByRole('row', { name: /Ada/ });
    (firstRow.element() as HTMLElement).focus();
    await expect.element(firstRow).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenLastCalledWith('p-1');
  });

  it('leaves the controls of a row to their own action', async () => {
    const { onRowClick, onAction } = await setupClickable();

    await page.getByRole('button', { name: 'Edit Ada' }).click();

    expect(onAction).toHaveBeenCalledWith('p-1');
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('keeps the actions column at the end while the others scroll', async () => {
    await setupClickable();

    const cell = page.getByRole('button', { name: 'Edit Ada' }).element()
      .parentElement as HTMLElement;
    expect(getComputedStyle(cell).position).toBe('sticky');
  });
});

describe('DataTablePagination page size', () => {
  it('offers the page sizes, and changes the size from the first page', async () => {
    const goToPage = vi.fn();
    const setPageSize = vi.fn();
    await render(
      <DataTablePagination
        table={{
          page: 3,
          pageSize: 10,
          setPageSize,
          goToPage,
          pageLink: () => undefined,
        }}
        pages={5}
        pageSizes={[10, 25, 50]}
        aria-label="Pages"
      />
    );

    await page.getByRole('combobox', { name: 'Rows per page' }).click();
    await page.getByRole('option', { name: '25' }).click();

    expect(setPageSize).toHaveBeenCalledWith(25);
  });

  it('shows no page size without page sizes', async () => {
    await render(
      <DataTablePagination
        table={{
          page: 1,
          pageSize: 10,
          goToPage: () => {},
          pageLink: () => undefined,
        }}
        pages={2}
        aria-label="Pages"
      />
    );

    await expect.element(page.getByRole('navigation')).toBeVisible();
    await expect
      .element(page.getByRole('combobox', { name: 'Rows per page' }))
      .not.toBeInTheDocument();
  });
});

describe('DataTable inside a page that scrolls', () => {
  it('lets the wheel scroll the page over a table that has nothing to scroll', async () => {
    await render(
      <div className="h-[300vh]">
        <DataTable columns={columnsOf(2)} data={[{ id: '0' }]} />
      </div>
    );
    const viewport = slot('data-table-viewport');
    document.scrollingElement?.scrollTo({ top: 0 });

    await userEvent.wheel(viewport, { delta: { y: 300 } });

    await expect
      .poll(() => document.scrollingElement?.scrollTop ?? 0)
      .toBeGreaterThan(0);
  });
});

describe('DataTable right to left', () => {
  it('shades the edges by start and end, which flip as it scrolls to its far end', async () => {
    await render(
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="flex h-75 w-100 flex-col">
          <DataTable columns={columnsOf(8)} data={[{ id: '0' }]} />
        </div>
      </DirectionProvider>
    );
    await expect.element(page.getByRole('table')).toBeVisible();
    const viewport = slot('data-table-viewport');
    const root = viewport.parentElement as HTMLElement;
    const shown = (name: 'start' | 'end') =>
      getComputedStyle(slot(`data-table-overflow-${name}`)).opacity;

    await expect.poll(() => shown('end')).toBe('1');
    expect(root.hasAttribute('data-overflow-x-start')).toBe(false);
    // The end of a right-to-left row is on the left, and its shade fades toward the right.
    const end = slot('data-table-overflow-end');
    expect(end.getBoundingClientRect().left).toBe(
      root.getBoundingClientRect().left
    );
    expect(getComputedStyle(end).backgroundImage).toContain('to right');

    // Right to left, the far end is a negative scroll.
    const toEnd = () => {
      viewport.scrollLeft = -viewport.scrollWidth;
    };
    await expect.poll(() => (toEnd(), shown('start'))).toBe('1');
    await expect.poll(() => (toEnd(), shown('end'))).toBe('0');
    expect(root.hasAttribute('data-overflow-x-start')).toBe(true);
    expect(root.hasAttribute('data-overflow-x-end')).toBe(false);
  });
});

describe('DataTable with no row', () => {
  it('keeps its empty state in view in a table wider than the screen', async () => {
    await render(
      <div className="flex h-75 w-100 flex-col">
        <DataTable
          columns={columnsOf(8)}
          data={[]}
          empty={<span>Nothing here</span>}
        />
      </div>
    );
    // In the body: the table's live region says it too.
    const text = page.getByRole('rowgroup').last().getByText('Nothing here');
    await expect.element(text).toBeVisible();
    const viewport = slot('data-table-viewport');
    const inView = () => {
      const box = text.element().getBoundingClientRect();
      const frame = viewport.getBoundingClientRect();
      return box.left >= frame.left && box.right <= frame.right;
    };

    await expect.poll(inView).toBe(true);
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    viewport.scrollLeft = viewport.scrollWidth;
    await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
    await expect.poll(inView).toBe(true);
  });
});

describe('DataTable layout', () => {
  it('says when it is busy, sets a column at the end, and gives a column its size', async () => {
    await render(
      <DataTable
        busy
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            title: 'Name',
            size: 240,
          },
          {
            id: 'amount',
            accessorKey: 'amount',
            title: 'Amount',
            align: 'end',
          },
        ]}
        data={[{ name: 'Ada', amount: 12 }]}
      />
    );

    const name = page.getByRole('columnheader', { name: 'Name' });
    await expect.element(name).toBeVisible();
    expect(name.element().getBoundingClientRect().width).toBe(240);
    expect(
      getComputedStyle(page.getByRole('cell', { name: '12' }).element())
        .textAlign
    ).toBe('end');
    expect(
      page.getByRole('rowgroup').last().element().getAttribute('aria-busy')
    ).toBe('true');
    // Busy once, on the rows: not on the table around them too.
    expect(document.querySelectorAll('[aria-busy]')).toHaveLength(1);
  });

  it('shows every column when the state hides them all', async () => {
    await render(
      <DataTable
        table={{
          sorting: { column: 'name', direction: 'asc' },
          sortHeader: () => ({ sorted: undefined, onSort: () => {} }),
          openFilter: () => {},
          hiddenColumns: ['name', 'role'],
        }}
        columns={[
          { id: 'name', accessorKey: 'name', title: 'Name' },
          { id: 'role', accessorKey: 'role', title: 'Role' },
        ]}
        data={[{ name: 'Ada', role: 'admin' }]}
      />
    );

    await expect
      .element(page.getByRole('cell', { name: 'admin' }))
      .toBeVisible();
    expect(page.getByRole('columnheader').elements()).toHaveLength(2);
  });
});

type Paged = {
  readonly page?: number | undefined;
  readonly orderBy?: 'name' | undefined;
  readonly dir?: 'asc' | 'desc' | undefined;
};

describe('DataTable with useDataTable', () => {
  it('goes to the last page from a page past it', async () => {
    function Table() {
      const store = useMemoryDataTableStore<Paged>({ page: 5 });
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      return <DataTablePagination table={table} pages={2} aria-label="Pages" />;
    }
    await render(<Table />);

    await expect
      .element(page.getByRole('button', { name: 'Page 2' }))
      .toHaveAttribute('aria-current', 'page');
  });

  it('scrolls back to the top on another page', async () => {
    function Table() {
      const store = useMemoryDataTableStore<Paged>();
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      return (
        <div className="flex h-75 flex-col">
          <DataTable
            table={table}
            columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
            data={Array.from({ length: 30 }, (_, i) => ({
              name: `Row ${table.page}.${i}`,
            }))}
            footer={
              <DataTablePagination table={table} pages={2} aria-label="Pages" />
            }
          />
        </div>
      );
    }
    await render(<Table />);
    const viewport = slot('data-table-viewport');
    await expect
      .element(page.getByText('Row 1.0', { exact: true }))
      .toBeVisible();
    viewport.scrollTop = 300;
    await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Page 2' }).click();

    await expect
      .element(page.getByText('Row 2.0', { exact: true }))
      .toBeVisible();
    await expect.poll(() => viewport.scrollTop).toBe(0);
  });

  it('keeps its scroll when rows are added at the end of a virtual table', async () => {
    const rowsOf = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: String(i),
        name: `Row ${i}`,
      }));
    function Table() {
      const [rows, setRows] = useState(() => rowsOf(100));
      return (
        <>
          <button type="button" onClick={() => setRows(rowsOf(200))}>
            Load more
          </button>
          <div className="flex h-75 flex-col">
            <DataTable
              columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
              data={rows}
              getRowId={(row) => row.id}
              virtual={{ rowHeight: 37 }}
            />
          </div>
        </>
      );
    }
    await render(<Table />);
    const viewport = slot('data-table-viewport');
    viewport.scrollTop = 1000;
    await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
    const before = viewport.scrollTop;

    await page.getByRole('button', { name: 'Load more' }).click();

    await expect
      .element(page.getByRole('table'))
      .toHaveAttribute('aria-rowcount', '201');
    expect(viewport.scrollTop).toBe(before);
  });

  it('says the new sorting aloud', async () => {
    function Table() {
      const store = useMemoryDataTableStore<Paged>();
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      return (
        <DataTable
          table={table}
          columns={[
            { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
          ]}
          data={[{ name: 'Ada' }]}
        />
      );
    }
    await render(<Table />);
    await expect.poll(sortSaid).toBe('');

    await page.getByRole('button', { name: 'Name' }).click();
    await page.getByRole('menuitemradio', { name: 'Descending' }).click();

    await expect.poll(sortSaid).toBe('Sorted by Name, descending');
    expect(emptySaid()).toBe('');
  });
});

describe('DataTable rows from the keyboard', () => {
  it('makes one row a stop of the Tab key, moves between rows with the arrows, Home and End, and opens one with Enter', async () => {
    const onRowClick = vi.fn();
    const names = ['Ada', 'Alan', 'Grace', 'Linus'];
    await render(
      <>
        <button type="button">Before</button>
        <DataTable
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={names.map((name) => ({ id: name, name }))}
          getRowId={(row) => row.id}
          onRowClick={(row, event) => onRowClick(row.name, event.type)}
        />
      </>
    );
    const row = (name: string) => page.getByRole('row', { name });
    const tabbable = () =>
      page
        .getByRole('row')
        .elements()
        .filter((element) => element.getAttribute('tabindex') === '0')
        .map((element) => element.textContent);

    expect(tabbable()).toEqual(['Ada']);
    await expect
      .element(row('Ada'))
      .toHaveAccessibleDescription(
        'Enter opens a row; the arrow keys move between rows.'
      );
    await page.getByRole('button', { name: 'Before' }).click();
    await userEvent.tab();
    await expect.element(row('Ada')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(row('Alan')).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(row('Linus')).toHaveFocus();
    expect(tabbable()).toEqual(['Linus']);
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(row('Linus')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(row('Ada')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');
    await expect.element(row('Alan')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith('Alan', 'keydown');
  });
});

describe('DataTable details', () => {
  it('does not light up the row of its empty state on hover', async () => {
    await render(
      <DataTable columns={columnsOf(2)} data={[]} empty="Nothing" />
    );
    const row = page.getByRole('row').last();
    await expect.element(row).toHaveTextContent('Nothing');

    await row.hover();

    const element = row.element();
    expect(getComputedStyle(element).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    // No transition toward another color has started.
    expect(element.getAnimations()).toHaveLength(0);
  });

  it('draws one line under its sticky header, not two', async () => {
    await render(<DataTable columns={columnsOf(2)} data={[{ id: '0' }]} />);
    const headerRow = page.getByRole('row').first();
    await expect.element(headerRow).toBeVisible();

    expect(getComputedStyle(headerRow.element()).borderBottomWidth).toBe('0px');
    const cell = page.getByRole('columnheader').first().element();
    expect(getComputedStyle(cell).boxShadow).toMatch(/inset/);
  });

  it('hides the shade of the end behind a column held at the end', async () => {
    await render(
      <div className="flex h-75 w-100 flex-col">
        <DataTable
          columns={[
            ...columnsOf(8),
            {
              id: 'actions',
              sticky: 'end',
              header: () => 'Actions',
              cell: () => 'Edit',
            },
          ]}
          data={[{ id: '0' }]}
        />
      </div>
    );
    await expect.element(page.getByRole('table')).toBeVisible();
    const root = slot('data-table-viewport').parentElement as HTMLElement;

    await expect
      .poll(() => root.hasAttribute('data-overflow-x-end'))
      .toBe(true);
    expect(slot('data-table').hasAttribute('data-sticky-end')).toBe(true);
    expect(getComputedStyle(slot('data-table-overflow-end')).display).toBe(
      'none'
    );
  });

  it('keeps a scroll past its end to itself only when it has rows to scroll', async () => {
    const screen = await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={columnsOf(1)}
          data={Array.from({ length: 30 }, (_, i) => ({ id: String(i) }))}
        />
      </div>
    );
    await expect
      .poll(
        () => getComputedStyle(slot('data-table-viewport')).overscrollBehaviorY
      )
      .toBe('none');

    await screen.rerender(
      <div className="flex h-75 flex-col">
        <DataTable columns={columnsOf(1)} data={[{ id: '0' }]} />
      </div>
    );
    await expect
      .poll(
        () => getComputedStyle(slot('data-table-viewport')).overscrollBehaviorY
      )
      .toBe('auto');
  });
});

describe('DataTable virtual rows from the keyboard', () => {
  const setupVirtual = async () => {
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={Array.from({ length: 1000 }, (_, i) => ({
            id: String(i),
            name: `Row ${i}`,
          }))}
          getRowId={(row) => row.id}
          virtual={{ rowHeight: 37 }}
          onRowClick={() => {}}
        />
      </div>
    );
    const first = page.getByRole('row', { name: 'Row 0', exact: true });
    await expect.element(first).toBeVisible();
    return { viewport: slot('data-table-viewport'), first };
  };
  const tabbable = () =>
    [...document.querySelectorAll<HTMLElement>('tr[data-row-index]')]
      .filter((row) => row.tabIndex === 0)
      .map((row) => row.dataset.rowIndex);
  const firstRendered = () =>
    document.querySelector<HTMLElement>('tr[data-row-index]')?.dataset.rowIndex;
  /** The first row wholly in view, below the sticky header: not one of the rows rendered above it. */
  const firstInView = () => {
    const head =
      document.querySelector('thead')?.getBoundingClientRect().bottom ?? 0;
    return [
      ...document.querySelectorAll<HTMLElement>('tr[data-row-index]'),
    ].find((row) => row.getBoundingClientRect().top >= head - 0.5)?.dataset
      .rowIndex;
  };

  it('gives the focus to the scroll area when the focused row scrolls out', async () => {
    const { viewport, first } = await setupVirtual();
    (first.element() as HTMLElement).focus();
    await expect.element(first).toHaveFocus();

    viewport.scrollTop = 10_000;

    await expect.poll(() => document.activeElement).toBe(viewport);
  });

  it('makes the first row in view a stop of the Tab key once the last focused is out of view', async () => {
    const { viewport, first } = await setupVirtual();
    (first.element() as HTMLElement).focus();
    viewport.scrollTop = 10_000;
    await expect.poll(firstRendered).not.toBe('0');

    await expect.poll(tabbable).toEqual([firstInView()]);
    // Not a row rendered above the view, for the overscan.
    expect(firstInView()).not.toBe(firstRendered());
  });
});

describe('DataTable rows under its sticky header', () => {
  type Item = { id: string; name: string };
  const items = (count: number): ReadonlyArray<Item> =>
    Array.from({ length: count }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
    }));
  const renderRows = async (virtual: boolean, onRowClick = vi.fn()) => {
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={items(virtual ? 1000 : 30)}
          getRowId={(row) => row.id}
          onRowClick={(row) => onRowClick(row.name)}
          {...(virtual && { virtual: { rowHeight: 37 } })}
        />
      </div>
    );
    const first = page.getByRole('row', { name: 'Row 0', exact: true });
    await expect.element(first).toBeVisible();
    (first.element() as HTMLElement).focus();
    return onRowClick;
  };
  /** How far the focused row's top sits below the header: never under it. */
  const belowHeader = () => {
    const head = document.querySelector('thead')?.getBoundingClientRect();
    const row = document.activeElement?.getBoundingClientRect();
    return (row?.top ?? 0) - (head?.bottom ?? 0);
  };
  const focusedRow = () =>
    (document.activeElement as HTMLElement | null)?.dataset.rowIndex;

  it('keeps a row focused from the keyboard below the header, going up from the end', async () => {
    await renderRows(false);
    await userEvent.keyboard('{End}');
    await expect.poll(focusedRow).toBe('29');

    for (let row = 28; row >= 20; row--) {
      await userEvent.keyboard('{ArrowUp}');
      await expect.poll(focusedRow).toBe(String(row));
      expect(belowHeader()).toBeGreaterThanOrEqual(-0.5);
    }
  });

  it('keeps a row focused from the keyboard below the header, in a virtual table', async () => {
    await renderRows(true);
    expect(getComputedStyle(slot('data-table-viewport')).scrollPaddingTop).toBe(
      `${document.querySelector('thead')?.getBoundingClientRect().height}px`
    );
    await userEvent.keyboard('{End}');
    await expect.poll(focusedRow).toBe('999');

    for (let row = 998; row >= 990; row--) {
      await userEvent.keyboard('{ArrowUp}');
      await expect.poll(focusedRow).toBe(String(row));
      expect(belowHeader()).toBeGreaterThanOrEqual(-0.5);
    }
    await userEvent.keyboard('{Home}');
    await expect.poll(focusedRow).toBe('0');
    expect(belowHeader()).toBeGreaterThanOrEqual(-0.5);
  });

  it('opens a row once while Enter is held', async () => {
    const onRowClick = await renderRows(false);
    const row = document.activeElement as HTMLElement;

    for (const repeat of [false, true, true])
      row.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', repeat, bubbles: true })
      );

    expect(onRowClick).toHaveBeenCalledExactlyOnceWith('Row 0');
  });

  it('describes the row that takes the focus only', async () => {
    await renderRows(false);

    const described = document.querySelectorAll('tr[aria-describedby]');
    expect(described).toHaveLength(1);
    expect((described[0] as HTMLElement).tabIndex).toBe(0);
  });
});

describe('DataTable horizontal scroll', () => {
  it('knows again it scrolls once wide rows come back after none', async () => {
    const table = (rows: number) => (
      <div className="flex h-75 w-100 flex-col">
        <DataTable
          // Short headers, long cells: the rows alone make it wide.
          columns={Array.from({ length: 6 }, (_, i) => ({
            id: `column-${i}`,
            header: `C${i}`,
            cell: () => 'A value long enough to widen its column',
          }))}
          data={Array.from({ length: rows }, (_, i) => ({ id: String(i) }))}
          empty="No results"
        />
      </div>
    );
    const screen = await render(table(3));
    const overflows = () =>
      slot('data-table-viewport').hasAttribute('data-has-overflow-x');
    await expect.poll(overflows).toBe(true);

    await screen.rerender(table(0));
    await expect.poll(overflows).toBe(false);

    await screen.rerender(table(3));
    await expect.poll(overflows).toBe(true);
  });
});

describe('DataTable selected rows', () => {
  it('shows a selected row in its own colors, at rest and hovered, the cell held at the end included', async () => {
    await render(
      <DataTable
        columns={[
          { id: 'name', accessorKey: 'name', title: 'Name' },
          {
            id: 'actions',
            sticky: 'end',
            header: () => 'Actions',
            cell: () => 'Edit',
          },
        ]}
        data={[
          { id: 'a', name: 'Ada' },
          { id: 'b', name: 'Alan' },
        ]}
        getRowId={(row) => row.id}
        selection={{ selected: new Set(['a']), onSelectedChange: () => {} }}
      />
    );
    const selected = page.getByRole('row', { name: /Ada/ });
    const other = page.getByRole('row', { name: /Alan/ });
    await expect.element(selected).toHaveAttribute('data-state', 'selected');
    const background = (element: Element) =>
      getComputedStyle(element).backgroundColor;
    const stickyCell = selected.getByRole('cell', { name: 'Edit' }).element();
    // Every color change of the rows and their cells has run its course.
    const settled = () =>
      expect
        .poll(() =>
          [...document.querySelectorAll('tbody tr, tbody td')].some(
            (element) => element.getAnimations().length > 0
          )
        )
        .toBe(false);
    // The pointer may rest where an earlier test left it, over a row: it leaves the table first.
    await userEvent.unhover(selected);
    await settled();
    const selectedColor = background(selected.element());
    expect(selectedColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(background(stickyCell)).toBe(selectedColor);

    await other.hover();
    await settled();
    const hoverColor = background(other.element());
    expect(hoverColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(hoverColor).not.toBe(selectedColor);
    expect(background(selected.element())).toBe(selectedColor);

    await selected.hover();
    await settled();
    const selectedHoverColor = background(selected.element());
    expect(selectedHoverColor).not.toBe(selectedColor);
    expect(selectedHoverColor).not.toBe(hoverColor);
    expect(background(stickyCell)).toBe(selectedHoverColor);
    // In light mode, the tints darken the row: selected more than hovered, selected and hovered more still.
    const lightness = (color: string) =>
      Number(/\(([\d.]+)/.exec(color)?.[1] ?? Number.NaN);
    expect(lightness(hoverColor) - lightness(selectedColor)).toBeGreaterThan(
      0.01
    );
    expect(
      lightness(selectedColor) - lightness(selectedHoverColor)
    ).toBeGreaterThan(0.01);
  });
});

describe('DataTable hovered rows inside a card', () => {
  it('lights a hovered row and its cell held at the end alike, apart from the card, in dark mode', async () => {
    await render(
      <div className="dark">
        <Card>
          <DataTable
            columns={[
              { id: 'name', accessorKey: 'name', title: 'Name' },
              {
                id: 'actions',
                sticky: 'end',
                header: () => 'Actions',
                cell: () => 'Edit',
              },
            ]}
            data={[{ name: 'Ada' }, { name: 'Alan' }]}
          />
        </Card>
      </div>
    );
    const row = page.getByRole('row', { name: /Ada/ });
    await expect.element(row).toBeVisible();
    const cell = row.getByRole('cell', { name: 'Edit' }).element();
    const background = (element: Element | null) =>
      element === null ? '' : getComputedStyle(element).backgroundColor;
    const card = background(document.querySelector('[data-slot=card]'));
    const settled = () =>
      expect
        .poll(() =>
          [row.element(), cell].some((e) => e.getAnimations().length > 0)
        )
        .toBe(false);

    await userEvent.unhover(row);
    await settled();
    // At rest: the table and its cell held at the end paint the card's color.
    expect(background(slot('data-table'))).toBe(card);
    expect(background(cell)).toBe(card);

    await row.hover();
    await settled();
    const hovered = background(row.element());
    expect(hovered).not.toBe(card);
    expect(hovered).not.toBe('rgba(0, 0, 0, 0)');
    expect(background(cell)).toBe(hovered);
  });
});

describe('DataTable with no row, in a large font', () => {
  it.each([{ direction: 'ltr' as const }, { direction: 'rtl' as const }])(
    'does not scroll sideways for its empty state, $direction',
    async ({ direction }) => {
      document.documentElement.style.fontSize = '120%';
      onTestFinished(() => {
        document.documentElement.style.fontSize = '';
      });
      await render(
        <DirectionProvider direction={direction}>
          <div dir={direction} className="flex h-75 w-100 flex-col">
            <DataTable
              columns={[{ id: 'name', header: 'Name', cell: () => '' }]}
              data={[]}
              empty="Nothing matches the search, try another one"
            />
          </div>
        </DirectionProvider>
      );
      await expect
        .element(page.getByRole('cell').getByText(/Nothing matches/))
        .toBeVisible();
      const viewport = slot('data-table-viewport');

      await expect
        .poll(() => viewport.scrollWidth - viewport.clientWidth)
        .toBeLessThanOrEqual(0);
      expect(viewport.hasAttribute('data-has-overflow-x')).toBe(false);
    }
  );
});

describe('DataTable focus', () => {
  it('gives the focus of its empty state to the scroll area once rows come', async () => {
    const table = (rows: number) => (
      <DataTable
        columns={columnsOf(1)}
        data={Array.from({ length: rows }, (_, i) => ({ id: String(i) }))}
        empty={<button type="button">Retry</button>}
      />
    );
    const screen = await render(table(0));
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect
      .element(page.getByRole('button', { name: 'Retry' }))
      .toHaveFocus();

    await screen.rerender(table(3));

    await expect
      .poll(() => document.activeElement)
      .toBe(slot('data-table-viewport'));
  });

  it('keeps the last row of a virtual table in view once End reaches it', async () => {
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={Array.from({ length: 1000 }, (_, i) => ({
            id: String(i),
            name: `Row ${i}`,
          }))}
          getRowId={(row) => row.id}
          virtual={{ rowHeight: 37 }}
          onRowClick={() => {}}
        />
      </div>
    );
    const first = page.getByRole('row', { name: 'Row 0', exact: true });
    await expect.element(first).toBeVisible();
    (first.element() as HTMLElement).focus();

    await userEvent.keyboard('{End}');

    const last = page.getByRole('row', { name: 'Row 999', exact: true });
    await expect.element(last).toHaveFocus();
    await expect
      .poll(
        () =>
          last.element().getBoundingClientRect().bottom -
          slot('data-table-viewport').getBoundingClientRect().bottom
      )
      .toBeLessThanOrEqual(0.5);
  });

  it('describes its rows in French with a narrow no-break space before the semicolon', async () => {
    await i18next.changeLanguage('fr');
    onTestFinished(async () => {
      await i18next.changeLanguage('en');
    });
    await render(
      <DataTable
        columns={columnsOf(1)}
        data={[{ id: '0' }]}
        onRowClick={() => {}}
      />
    );
    const row = page.getByRole('row').last();
    await expect.element(row).toBeVisible();

    const hint = document.getElementById(
      row.element().getAttribute('aria-describedby') ?? ''
    );
    expect(hint?.textContent).toContain('\u202f;');
  });
});

describe('DataTable sized by the app', () => {
  it("keeps the app's style, and its own header height for the scroll", async () => {
    await render(
      <div className="flex h-100 flex-col">
        <DataTable
          style={{ '--h': '200px' } as React.CSSProperties}
          className="h-(--h)"
          columns={columnsOf(1)}
          data={Array.from({ length: 30 }, (_, i) => ({ id: String(i) }))}
        />
      </div>
    );
    await expect.element(page.getByRole('table')).toBeVisible();

    expect(slot('data-table').getBoundingClientRect().height).toBe(200);
    const header = document.querySelector('thead')?.getBoundingClientRect();
    await expect
      .poll(
        () => getComputedStyle(slot('data-table-viewport')).scrollPaddingTop
      )
      .toBe(`${header?.height}px`);
    const scrollbar = document.querySelector<HTMLElement>(
      '[data-slot=scroll-area-scrollbar][data-orientation=vertical]'
    );
    expect(scrollbar && getComputedStyle(scrollbar).paddingTop).toBe(
      `${header?.height}px`
    );
  });
});

describe('DataTable scroll on other rows', () => {
  it('shows no frame of the new rows at the old scroll', async () => {
    const api: { goToPage: (page: number) => void } = { goToPage: () => {} };
    function Table() {
      const store = useMemoryDataTableStore<Paged>();
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      useEffect(() => {
        api.goToPage = table.goToPage;
      });
      return (
        <div className="flex h-75 flex-col">
          <DataTable
            table={table}
            columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
            data={Array.from({ length: 30 }, (_, i) => ({
              name: `Row ${table.page}.${i}`,
            }))}
          />
        </div>
      );
    }
    await render(<Table />);
    const viewport = slot('data-table-viewport');
    await expect
      .element(page.getByText('Row 1.0', { exact: true }))
      .toBeVisible();
    viewport.scrollTop = 300;
    await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
    // Read as soon as the new rows are in the page, before any later effect or frame.
    const seen: Array<number> = [];
    const observer = new MutationObserver(() => seen.push(viewport.scrollTop));
    observer.observe(document.querySelector('tbody') as Node, {
      subtree: true,
      characterData: true,
      childList: true,
    });
    onTestFinished(() => observer.disconnect());

    // Not from a click, whose effects React runs at once: from a fetch, a timer.
    setTimeout(() => api.goToPage(2));

    await expect
      .element(page.getByText('Row 2.0', { exact: true }))
      .toBeVisible();
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0]).toBe(0);
  });
});

describe('DataTable inside a card', () => {
  it('gives its sticky cells the background of the card, in dark mode too', async () => {
    await render(
      <div className="dark">
        <Card>
          <DataTable
            columns={[
              ...columnsOf(2),
              {
                id: 'actions',
                sticky: 'end',
                header: () => 'Actions',
                cell: () => 'Edit',
              },
            ]}
            data={[{ id: '0' }]}
          />
        </Card>
      </div>
    );
    await expect.element(page.getByRole('table')).toBeVisible();
    const background = (element: Element | null) =>
      element === null ? '' : getComputedStyle(element).backgroundColor;
    const card = background(document.querySelector('[data-slot=card]'));
    // The pointer may rest where an earlier test left it, over a row: it leaves the table first.
    await userEvent.unhover(page.getByRole('table'));
    await expect
      .poll(() =>
        [...document.querySelectorAll('tbody tr, tbody td')].some(
          (element) => element.getAnimations().length > 0
        )
      )
      .toBe(false);

    expect(card).not.toBe(background(document.body));
    expect(background(page.getByRole('columnheader').first().element())).toBe(
      card
    );
    expect(background(page.getByRole('cell', { name: 'Edit' }).element())).toBe(
      card
    );
  });
});

describe('DataTable column groups', () => {
  const group = (id: string, title: string) => ({
    id,
    title,
    columns: [
      { id: `${id}-a`, accessorKey: 'a', title: `${title} A` },
      { id: `${id}-b`, accessorKey: 'b', title: `${title} B` },
    ],
  });
  const shadow = (name: string) =>
    getComputedStyle(
      page.getByRole('columnheader', { name, exact: true }).element()
    ).boxShadow;
  // A side line: a horizontal offset of a pixel. The line under the header, a vertical one, is not.
  const startEdge = /\) 1px 0px 0px/;
  const endEdge = /\) -1px 0px 0px/;

  it.each([
    { groups: 'two groups', titles: ['One', 'Two'] },
    { groups: 'a group alone', titles: ['One'] },
  ])('draws no side line beside $groups', async ({ titles }) => {
    await render(
      <DataTable
        columns={titles.map((title) => group(title.toLowerCase(), title))}
        data={[{ a: 1, b: 2 }]}
      />
    );
    await expect.element(page.getByRole('table')).toBeVisible();

    for (const title of titles) {
      expect(shadow(title)).not.toMatch(startEdge);
      expect(shadow(title)).not.toMatch(endEdge);
    }
  });
});

type Searched = {
  readonly q?: string | undefined;
  readonly orderBy?: 'name' | undefined;
};

const names = ['Ada', 'Alan', 'Grace'];

function Searchable() {
  const store = useMemoryDataTableStore<Searched>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  const q = table.state.q ?? '';
  return (
    <>
      <DataTableToolbar table={table} search={{ 'aria-label': 'Search' }} />
      <DataTable
        table={table}
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            title: 'Name',
            filter: 'search',
          },
        ]}
        data={names
          .filter((name) => name.toLowerCase().includes(q.toLowerCase()))
          .map((name) => ({ name }))}
        empty={<DataTableEmptyState searchTerm={q} onReset={table.reset} />}
      />
    </>
  );
}

describe('DataTable live region', () => {
  it('says aloud that a search found nothing', async () => {
    await render(<Searchable />);
    await expect.poll(emptySaid).toBe('');

    await page.getByRole('textbox', { name: 'Search' }).fill('zed');

    await expect.poll(emptySaid).toBe('No results for “zed”');
    expect(sortSaid()).toBe('');
  });

  it('leaves an error to its own alert', async () => {
    const table = (rows: number) => (
      <DataTable
        columns={columnsOf(1)}
        data={Array.from({ length: rows }, (_, i) => ({ id: String(i) }))}
        empty={<DataTableErrorState />}
      />
    );
    const screen = await render(table(2));

    await screen.rerender(table(0));

    await expect.element(page.getByRole('alert')).toBeVisible();
    expect(emptySaid()).toBe('');
  });

  it('offers the search from a column header from the first paint', async () => {
    const seen: Array<boolean> = [];
    // Reads the header before the browser paints the first frame.
    function FirstFrame() {
      useLayoutEffect(() => {
        requestAnimationFrame(() =>
          seen.push(document.querySelector('thead th button') !== null)
        );
      }, []);
      return null;
    }
    await render(
      <>
        <Searchable />
        <FirstFrame />
      </>
    );

    await expect.poll(() => seen).toEqual([true]);
  });
});

describe('DataTable rows, a page at a time', () => {
  it('moves the focus a viewport of rows down and up, and keeps Space from scrolling', async () => {
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={Array.from({ length: 30 }, (_, i) => ({
            id: String(i),
            name: `Row ${i}`,
          }))}
          getRowId={(row) => row.id}
          onRowClick={() => {}}
        />
      </div>
    );
    const first = page.getByRole('row', { name: 'Row 0', exact: true });
    await expect.element(first).toBeVisible();
    const row = first.element() as HTMLElement;
    row.focus();
    const viewport = slot('data-table-viewport');
    const header =
      document.querySelector('thead')?.getBoundingClientRect().height ?? 0;
    const shown = Math.floor(
      (viewport.clientHeight - header) / row.offsetHeight
    );
    expect(shown).toBeGreaterThan(1);

    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    row.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);

    await userEvent.keyboard('{PageDown}');
    await expect
      .element(page.getByRole('row', { name: `Row ${shown}`, exact: true }))
      .toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    await expect
      .element(page.getByRole('row', { name: `Row ${shown * 2}`, exact: true }))
      .toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    await expect
      .element(page.getByRole('row', { name: `Row ${shown}`, exact: true }))
      .toHaveFocus();
  });
});

describe('DataTable hidden columns', () => {
  it('hides titled columns only: a URL cannot hide the actions', async () => {
    await render(
      <DataTable
        table={{
          sorting: { column: 'name', direction: 'asc' },
          sortHeader: () => ({ sorted: undefined, onSort: () => {} }),
          openFilter: () => {},
          hiddenColumns: ['actions'],
        }}
        columns={[
          { id: 'name', accessorKey: 'name', title: 'Name' },
          { id: 'actions', header: () => 'Actions', cell: () => 'Edit' },
        ]}
        data={[{ name: 'Ada' }]}
      />
    );

    await expect
      .element(page.getByRole('cell', { name: 'Edit' }))
      .toBeVisible();
    await expect
      .element(page.getByRole('columnheader', { name: 'Actions' }))
      .toBeVisible();
  });
});

describe('DataTable live region, exactly', () => {
  const said = emptySaid;

  it('says the message of an empty search alone, and again after rows came back', async () => {
    await render(<Searchable />);
    const search = page.getByRole('textbox', { name: 'Search' });

    await search.fill('zed');
    await expect.poll(said).toBe('No results for “zed”');
    // Not the button beside the message.
    await expect
      .element(
        page.getByRole('cell').getByRole('button', { name: 'Clear filters' })
      )
      .toBeVisible();

    await search.fill('');
    await expect
      .element(page.getByRole('cell', { name: 'Ada', exact: true }))
      .toBeVisible();
    await expect.poll(said).toBe('');

    await search.fill('zed');
    await expect.poll(said).toBe('No results for “zed”');
  });

  it('stops saying it is loading once rows come', async () => {
    const table = (rows: number) => (
      <DataTable
        columns={columnsOf(1)}
        data={Array.from({ length: rows }, (_, i) => ({ id: String(i) }))}
        empty={<DataTableLoadingState />}
      />
    );
    const screen = await render(table(0));
    await expect.poll(said).toBe('Loading…');

    await screen.rerender(table(2));

    await expect.poll(said).toBe('');
  });

  it('reads the text of an empty slot of its own, but its buttons and links', async () => {
    await render(
      <DataTable
        columns={columnsOf(1)}
        data={[]}
        empty={
          <div>
            Nothing here yet. <button type="button">Add one</button>{' '}
            <a href="#help">Help</a>
          </div>
        }
      />
    );

    await expect.poll(said).toBe('Nothing here yet.');
  });
});

describe('DataTable focus on rows that go', () => {
  it('gives the focus to the scroll area when the focused row is removed', async () => {
    const table = (names: ReadonlyArray<string>) => (
      <DataTable
        columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
        data={names.map((name) => ({ name }))}
        getRowId={(row) => row.name}
        onRowClick={() => {}}
      />
    );
    const screen = await render(table(['Ada', 'Alan', 'Grace']));
    const alan = page.getByRole('row', { name: 'Alan' });
    (alan.element() as HTMLElement).focus();
    await expect.element(alan).toHaveFocus();

    await screen.rerender(table(['Ada', 'Grace']));

    await expect
      .poll(() => document.activeElement)
      .toBe(slot('data-table-viewport'));
  });

  it('makes the first row the stop of the Tab key again on another page, rows keyed by their index', async () => {
    function Table() {
      const store = useMemoryDataTableStore<Paged>();
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      return (
        <DataTable
          table={table}
          columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
          data={Array.from({ length: 5 }, (_, i) => ({
            name: `Row ${table.page}.${i}`,
          }))}
          onRowClick={() => {}}
          footer={
            <DataTablePagination table={table} pages={2} aria-label="Pages" />
          }
        />
      );
    }
    await render(<Table />);
    const tabbable = () =>
      [...document.querySelectorAll<HTMLElement>('tr[data-row-index]')]
        .filter((row) => row.tabIndex === 0)
        .map((row) => row.textContent);
    const first = page.getByRole('row', { name: 'Row 1.0' });
    (first.element() as HTMLElement).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect.poll(tabbable).toEqual(['Row 1.2']);

    await page.getByRole('button', { name: 'Next' }).click();

    await expect
      .element(page.getByRole('row', { name: 'Row 2.0' }))
      .toBeVisible();
    expect(tabbable()).toEqual(['Row 2.0']);
  });
});

describe('DataTable live region, sorting and loading', () => {
  it('says the sorting and that rows load, then the sorting alone once they came', async () => {
    function Table() {
      const store = useMemoryDataTableStore<Paged>();
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      // The rows of the sorting asked for load until "Finish loading".
      const [loaded, setLoaded] = useState(table.state.dir);
      return (
        <>
          <button type="button" onClick={() => setLoaded(table.state.dir)}>
            Finish loading
          </button>
          <DataTable
            table={table}
            columns={[
              {
                id: 'name',
                accessorKey: 'name',
                title: 'Name',
                sortable: true,
              },
            ]}
            data={loaded === table.state.dir ? [{ name: 'Ada' }] : []}
            empty={<DataTableLoadingState />}
          />
        </>
      );
    }
    await render(<Table />);
    expect([sortSaid(), emptySaid()]).toEqual(['', '']);

    await page.getByRole('button', { name: 'Name' }).click();
    await page.getByRole('menuitemradio', { name: 'Descending' }).click();
    await expect.poll(sortSaid).toBe('Sorted by Name, descending');
    await expect.poll(emptySaid).toBe('Loading…');
    // From here, the sorting is said once: its region is not written again.
    const writes: Array<MutationRecord> = [];
    const observer = new MutationObserver((records) => writes.push(...records));
    observer.observe(regions().sorting, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    onTestFinished(() => observer.disconnect());

    await page.getByRole('button', { name: 'Finish loading' }).click();
    await expect.element(page.getByRole('cell', { name: 'Ada' })).toBeVisible();
    await expect.poll(emptySaid).toBe('');
    expect(sortSaid()).toBe('Sorted by Name, descending');
    expect(writes).toEqual([]);
  });
});

describe('DataTable rows, a page at a time, in a table taller than the window', () => {
  it('moves the focus by the rows the window shows, not to the end', async () => {
    const [width, height] = [innerWidth, innerHeight];
    await page.viewport(width, 300);
    onTestFinished(() => page.viewport(width, height));
    await render(
      <DataTable
        columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
        data={Array.from({ length: 50 }, (_, i) => ({
          id: String(i),
          name: `Row ${i}`,
        }))}
        getRowId={(row) => row.id}
        onRowClick={() => {}}
      />
    );
    const first = page.getByRole('row', { name: 'Row 0', exact: true });
    await expect.element(first).toBeVisible();
    const row = first.element() as HTMLElement;
    row.focus();
    const box = slot('data-table-viewport').getBoundingClientRect();
    const header =
      document.querySelector('thead')?.getBoundingClientRect().height ?? 0;
    const shown = Math.floor(
      (Math.min(box.bottom, innerHeight) - Math.max(box.top + header, 0)) /
        row.offsetHeight
    );
    expect(shown).toBeGreaterThan(1);
    expect(shown).toBeLessThan(20);

    await userEvent.keyboard('{PageDown}');

    await expect
      .element(page.getByRole('row', { name: `Row ${shown}`, exact: true }))
      .toHaveFocus();
  });
});

describe('DataTable rows and the middle button', () => {
  it('opens a row on a middle click, telling it so, but not from its own controls', async () => {
    const onRowClick = vi.fn();
    await render(
      <DataTable
        columns={[
          { id: 'name', accessorKey: 'name', title: 'Name' },
          {
            id: 'actions',
            header: () => 'Actions',
            cell: () => <button type="button">Edit</button>,
          },
        ]}
        data={[{ name: 'Ada' }]}
        onRowClick={(row, event) =>
          onRowClick(
            row.name,
            event.type,
            'button' in event ? event.button : undefined
          )
        }
      />
    );
    const middle = () =>
      new MouseEvent('auxclick', {
        button: 1,
        bubbles: true,
        cancelable: true,
      });

    page.getByRole('cell', { name: 'Ada' }).element().dispatchEvent(middle());
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith('Ada', 'auxclick', 1);

    page
      .getByRole('button', { name: 'Edit' })
      .element()
      .dispatchEvent(middle());
    expect(onRowClick).toHaveBeenCalledOnce();
  });
});

describe('DataTable at phone width', () => {
  it('keeps a long search with no break inside the screen when nothing matches', async () => {
    const [width, height] = [innerWidth, innerHeight];
    await page.viewport(375, 700);
    onTestFinished(() => page.viewport(width, height));
    const term = 'x'.repeat(120);
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={columnsOf(2)}
          data={[]}
          empty={<DataTableEmptyState searchTerm={term} />}
        />
      </div>
    );
    const message = page
      .getByRole('cell')
      .getByText(`No results for “${term}”`);
    await expect.element(message).toBeVisible();

    const box = message.element().getBoundingClientRect();
    const frame = slot('data-table-viewport').getBoundingClientRect();
    expect(box.left).toBeGreaterThanOrEqual(frame.left);
    expect(box.right).toBeLessThanOrEqual(frame.right);
    expect(box.right).toBeLessThanOrEqual(375);
  });

  it('does not count rows for assistive tech in a virtual table with none', async () => {
    await render(
      <div className="flex h-75 flex-col">
        <DataTable
          columns={columnsOf(1)}
          data={[]}
          virtual={{ rowHeight: 37 }}
          empty="Nothing"
        />
      </div>
    );
    await expect.element(page.getByRole('table')).toBeVisible();

    expect(
      page.getByRole('table').element().hasAttribute('aria-rowcount')
    ).toBe(false);
  });
});

describe('DataTable rows and modifier keys', () => {
  it('leaves Alt and Ctrl with an arrow to the browser, ignores Shift, and goes to an end with Cmd', async () => {
    await render(
      <DataTable
        columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
        data={['Ada', 'Alan', 'Grace', 'Linus'].map((name) => ({ name }))}
        onRowClick={() => {}}
      />
    );
    const row = (name: string) => page.getByRole('row', { name });
    (row('Alan').element() as HTMLElement).focus();
    await expect.element(row('Alan')).toHaveFocus();
    const press = (init: KeyboardEventInit) => {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      document.activeElement?.dispatchEvent(event);
      return event;
    };

    expect(press({ key: 'ArrowDown', altKey: true }).defaultPrevented).toBe(
      false
    );
    expect(press({ key: 'ArrowDown', ctrlKey: true }).defaultPrevented).toBe(
      false
    );
    press({ key: 'ArrowDown', shiftKey: true });
    await expect.element(row('Alan')).toHaveFocus();

    expect(press({ key: 'ArrowDown', metaKey: true }).defaultPrevented).toBe(
      true
    );
    await expect.element(row('Linus')).toHaveFocus();
    press({ key: 'ArrowUp', metaKey: true });
    await expect.element(row('Ada')).toHaveFocus();
  });
});

describe('DataTable live region, an empty slot that changes on its own', () => {
  it('reads the slot again when its text changes', async () => {
    const ticker = { set: (_text: string) => {} };
    function Ticker() {
      const [text, setText] = useState('Loading the first batch');
      useEffect(() => {
        ticker.set = setText;
      }, []);
      return <p>{text}</p>;
    }
    await render(
      <DataTable columns={columnsOf(1)} data={[]} empty={<Ticker />} />
    );
    await expect.poll(emptySaid).toBe('Loading the first batch');

    ticker.set('Still loading, almost there');

    await expect.poll(emptySaid).toBe('Still loading, almost there');
  });

  it('reads it again in the language switched to while it loads', async () => {
    onTestFinished(async () => {
      await i18next.changeLanguage('en');
    });
    await render(
      <DataTable
        columns={columnsOf(1)}
        data={[]}
        empty={<DataTableLoadingState />}
      />
    );
    await expect.poll(emptySaid).toBe('Loading…');

    await i18next.changeLanguage('fr');

    await expect
      .poll(emptySaid)
      .toBe(i18next.t('components:dataTable.states.loading'));
    expect(emptySaid()).not.toBe('Loading…');
  });
});
