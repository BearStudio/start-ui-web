import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  DataTable,
  type DataTableColumn,
  type DataTableColumnFor,
} from '@/components/ui/data-table/data-table';
import { selectFilter } from '@/components/ui/data-table/filters/select-filter';
import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import {
  DataTableSelectionBar,
  useDataTableSelection,
} from '@/components/ui/data-table/selection';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

import { render } from '@/tests/utils';

type Person = { id: string; name: string; locked?: boolean };

const people: ReadonlyArray<Person> = [
  { id: 'p-1', name: 'Ada' },
  { id: 'p-2', name: 'Alan' },
  { id: 'p-3', name: 'Grace', locked: true },
  { id: 'p-4', name: 'Linus' },
  { id: 'p-5', name: 'Ken' },
];

const columns: ReadonlyArray<DataTableColumn<Person>> = [
  { id: 'name', accessorKey: 'name', title: 'Name' },
];

function Harness({
  rows = people,
  onRowClick,
  onAction,
}: {
  rows?: ReadonlyArray<Person>;
  onRowClick?: (id: string) => void;
  onAction?: (ids: ReadonlyArray<string>) => void;
}) {
  const selection = useDataTableSelection<Person>({
    rowLabel: (person) => `Select ${person.name}`,
    canSelect: (person) => !person.locked,
  });
  const [shown, setShown] = useState(rows);
  return (
    <>
      <button type="button" onClick={() => setShown(rows.slice(3))}>
        Next page
      </button>
      <DataTableSelectionBar count={selection.count} onClear={selection.clear}>
        <button type="button" onClick={() => onAction?.(selection.ids)}>
          Archive
        </button>
      </DataTableSelectionBar>
      <DataTable
        columns={columns}
        data={shown}
        label="People"
        getRowId={(person) => person.id}
        selection={selection}
        {...(onRowClick && {
          onRowClick: (person: Person) => onRowClick(person.id),
        })}
      />
    </>
  );
}

const checkbox = (name: string) => page.getByRole('checkbox', { name });
const selectAll = () => checkbox('Select all rows shown');
/** The bar, shown while rows are selected, named by how many. */
const bar = (count: number) =>
  page.getByRole('region', { name: `${count} selected` });

describe('DataTable selection', () => {
  it('selects rows one by one, and shows how many with the actions', async () => {
    const onAction = vi.fn();
    await render(<Harness onAction={onAction} />);

    await expect
      .element(page.getByRole('region', { name: /selected/ }))
      .not.toBeInTheDocument();

    await checkbox('Select Ada').click();
    await checkbox('Select Linus').click();

    await expect.element(checkbox('Select Ada')).toBeChecked();
    await expect.element(bar(2)).toBeVisible();
    await expect
      .element(page.getByRole('row', { name: /Ada/ }))
      .toHaveAttribute('data-state', 'selected');

    await page.getByRole('button', { name: 'Archive' }).click();
    expect(onAction).toHaveBeenCalledWith(['p-1', 'p-4']);
  });

  it('announces the count from the first row ticked, in a status there before it', async () => {
    await render(<Harness />);
    const status = document.querySelector(
      '[data-slot=data-table-selection-bar]'
    )?.previousElementSibling;
    if (!(status instanceof HTMLElement)) throw new Error('No status.');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.textContent).toBe('');

    await checkbox('Select Ada').click();

    await expect.element(status).toHaveTextContent('1 selected');
    // The count the bar shows is not read twice.
    expect(
      bar(1).getByText('1 selected').element().getAttribute('aria-hidden')
    ).toBe('true');
  });

  it('selects every row that can be, then clears them, from the header', async () => {
    await render(<Harness />);

    await checkbox('Select Ada').click();
    await expect.element(selectAll()).toHaveAttribute('aria-checked', 'mixed');

    await selectAll().click();
    await expect.element(selectAll()).toBeChecked();
    await expect.element(bar(4)).toBeVisible();
    await expect.element(checkbox('Select Grace')).not.toBeChecked();
    await expect.element(checkbox('Select Grace')).toBeDisabled();

    await selectAll().click();
    await expect.element(selectAll()).not.toBeChecked();
    await expect.element(checkbox('Select Ada')).not.toBeChecked();
  });

  it('selects the rows between two with Shift, skipping those that cannot be', async () => {
    await render(<Harness />);

    await checkbox('Select Ada').click();
    await userEvent.keyboard('{Shift>}');
    await checkbox('Select Ken').click();
    await userEvent.keyboard('{/Shift}');

    await expect.element(bar(4)).toBeVisible();
    await expect.element(checkbox('Select Linus')).toBeChecked();
    await expect.element(checkbox('Select Grace')).not.toBeChecked();
  });

  it('keeps the selection of a page while another one shows, and clears it on demand', async () => {
    await render(<Harness />);

    await checkbox('Select Ada').click();
    await page.getByRole('button', { name: 'Next page' }).click();
    await checkbox('Select Ken').click();

    await expect.element(bar(2)).toBeVisible();
    // The header counts the rows shown only.
    await expect.element(selectAll()).toHaveAttribute('aria-checked', 'mixed');

    await page.getByRole('button', { name: 'Clear selection' }).click();
    await expect.element(checkbox('Select Ken')).not.toBeChecked();
    await expect
      .element(page.getByRole('region', { name: /selected/ }))
      .not.toBeInTheDocument();
  });

  it('does not open a row when its checkbox, or the cell around it, is clicked', async () => {
    const onRowClick = vi.fn();
    await render(<Harness onRowClick={onRowClick} />);

    await checkbox('Select Ada').click();
    const cell = (checkbox('Select Ada').element() as HTMLElement).closest(
      'td'
    );
    cell?.click();
    expect(onRowClick).not.toHaveBeenCalled();

    await page.getByRole('cell', { name: 'Alan', exact: true }).click();
    expect(onRowClick).toHaveBeenCalledWith('p-2');
    await expect.element(checkbox('Select Alan')).not.toBeChecked();
  });
});

function FilteredHarness({ mode }: { mode: 'matching' | 'resetOn' }) {
  const [onlyA, setOnlyA] = useState(false);
  const shown = onlyA
    ? people.filter((person) => person.name.startsWith('A'))
    : people;
  const selection = useDataTableSelection<Person>({
    rowLabel: (person) => `Select ${person.name}`,
    ...(mode === 'matching'
      ? { matching: shown.map((person) => person.id) }
      : { resetOn: onlyA }),
  });
  return (
    <>
      <button type="button" onClick={() => setOnlyA((value) => !value)}>
        Toggle the filter
      </button>
      <DataTableSelectionBar
        count={selection.count}
        onClear={selection.clear}
      />
      <DataTable
        columns={columns}
        data={shown}
        label="People"
        getRowId={(person) => person.id}
        selection={selection}
      />
    </>
  );
}

describe('DataTable selection under a filter', () => {
  it('narrows the selection to the rows the filter keeps, for good', async () => {
    await render(<FilteredHarness mode="matching" />);

    await checkbox('Select Ada').click();
    await checkbox('Select Linus').click();
    await expect.element(bar(2)).toBeVisible();

    await page.getByRole('button', { name: 'Toggle the filter' }).click();
    await expect.element(bar(1)).toBeVisible();

    await page.getByRole('button', { name: 'Toggle the filter' }).click();
    await expect.element(bar(1)).toBeVisible();
    await expect.element(checkbox('Select Linus')).not.toBeChecked();
  });

  it('clears the selection when the filter changes, given resetOn', async () => {
    await render(<FilteredHarness mode="resetOn" />);

    await checkbox('Select Ada').click();
    await page.getByRole('button', { name: 'Toggle the filter' }).click();

    await expect
      .element(page.getByRole('region', { name: /selected/ }))
      .not.toBeInTheDocument();
    await expect.element(checkbox('Select Ada')).not.toBeChecked();
  });
});

type Search = {
  readonly q?: string | undefined;
  readonly orderBy?: 'name' | undefined;
};

function ToolbarHarness() {
  const store = useMemoryDataTableStore<Search>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  const selection = useDataTableSelection<Person>({
    rowLabel: (person) => `Select ${person.name}`,
  });
  return (
    <>
      <DataTableToolbar
        table={table}
        search={{ 'aria-label': 'Search' }}
        selection={selection}
        selectionActions={<button type="button">Archive</button>}
      />
      <DataTable
        columns={columns}
        data={people}
        label="People"
        getRowId={(person) => person.id}
        selection={selection}
      />
    </>
  );
}

describe('DataTableToolbar with a selection', () => {
  it('shows the selection in place of its controls while rows are selected, and the table stays put', async () => {
    await render(<ToolbarHarness />);
    const search = page.getByRole('textbox', { name: 'Search' });
    await expect.element(search).toBeVisible();
    const top = () =>
      page.getByRole('table').element().getBoundingClientRect().top;
    const before = top();

    await checkbox('Select Ada').click();

    await expect.element(bar(1)).toBeVisible();
    await expect
      .element(bar(1).getByRole('button', { name: 'Archive' }))
      .toBeVisible();
    await expect.element(search).not.toBeInTheDocument();
    expect(top()).toBe(before);

    await bar(1).getByRole('button', { name: 'Clear selection' }).click();
    await expect.element(search).toBeVisible();
    await expect.element(bar(1)).not.toBeInTheDocument();
    await expect.element(checkbox('Select Ada')).not.toBeChecked();
  });
});

type Filtered = {
  readonly q?: string | undefined;
  readonly orderBy?: 'name' | undefined;
  readonly status?: 'active' | 'invited' | undefined;
};
type Member = Person & { status: string };

const members: ReadonlyArray<Member> = people.map((person) => ({
  ...person,
  status: 'active',
}));
const memberColumns: ReadonlyArray<DataTableColumnFor<Member, Filtered>> = [
  { id: 'name', accessorKey: 'name', title: 'Name', filter: 'search' },
  { id: 'status', accessorKey: 'status', title: 'Status', filter: 'status' },
];

/** A toolbar crowded enough to wrap in a narrow page, over a table whose headers open its filters. */
function CrowdedHarness({ onArchive }: { onArchive?: () => void }) {
  const store = useMemoryDataTableStore<Filtered>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    filters: {
      status: selectFilter({
        title: 'Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'invited', label: 'Invited' },
        ],
      }),
    },
  });
  const selection = useDataTableSelection<Member>({
    rowLabel: (person) => `Select ${person.name}`,
  });
  return (
    <div className="w-80">
      <input aria-label="Note" />
      <DataTableToolbar
        table={table}
        search={{ 'aria-label': 'Search' }}
        selection={selection}
        selectionActions={
          <button
            type="button"
            onClick={() => (onArchive ? onArchive() : selection.clear())}
          >
            Archive
          </button>
        }
      >
        <button type="button">Export</button>
        <button
          type="button"
          onClick={() => selection.onSelectedChange(new Set(['p-1', 'p-2']))}
        >
          Pick two
        </button>
      </DataTableToolbar>
      <DataTable
        table={table}
        columns={memberColumns}
        data={members}
        label="People"
        getRowId={(person) => person.id}
        selection={selection}
      />
    </div>
  );
}

const controls = () =>
  document.querySelector('[data-slot=data-table-toolbar]')
    ?.lastElementChild as HTMLElement;

describe('DataTableToolbar with a selection, in a narrow page', () => {
  it('keeps the table in place though its controls wrap over several lines, and makes them inert', async () => {
    await render(<CrowdedHarness />);
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toBeVisible();
    // Wrapped: taller than one line of controls.
    expect(controls().getBoundingClientRect().height).toBeGreaterThan(40);
    const top = () =>
      page.getByRole('table').element().getBoundingClientRect().top;
    const before = top();

    await checkbox('Select Ada').click();

    await expect.element(bar(1)).toBeVisible();
    expect(top()).toBe(before);
    expect(controls().inert).toBe(true);
    expect(getComputedStyle(controls()).visibility).toBe('hidden');
  });

  it.each([
    { through: 'the Clear button', button: 'Clear selection' },
    { through: 'an action that clears it', button: 'Archive' },
  ])(
    'gives the focus to the search once the selection empties through $through',
    async ({ button }) => {
      await render(<CrowdedHarness />);
      await checkbox('Select Ada').click();

      await bar(1).getByRole('button', { name: button }).click();

      await expect
        .element(page.getByRole('textbox', { name: 'Search' }))
        .toHaveFocus();
    }
  );

  it('leaves the focus where an action moved it', async () => {
    await render(
      <CrowdedHarness
        onArchive={() => {
          page.getByRole('textbox', { name: 'Note' }).element().focus();
          (
            page
              .getByRole('button', { name: 'Clear selection' })
              .element() as HTMLElement
          ).click();
        }}
      />
    );
    await checkbox('Select Ada').click();

    await bar(1).getByRole('button', { name: 'Archive' }).click();

    await expect.element(bar(1)).not.toBeInTheDocument();
    await expect
      .element(page.getByRole('textbox', { name: 'Note' }))
      .toHaveFocus();
  });

  it('shows the controls again for a filter asked from a column header, its menu by its chip', async () => {
    await render(<CrowdedHarness />);
    await checkbox('Select Ada').click();
    await expect.element(bar(1)).toBeVisible();

    await page
      .getByRole('columnheader', { name: 'Status', exact: true })
      .getByRole('button')
      .click();

    const option = page.getByRole('menuitemradio', { name: 'Active' });
    await expect.element(option).toBeVisible();
    expect(controls().inert).toBe(false);
    const trigger = page
      .getByRole('group', { name: 'Status filter' })
      .getByRole('button')
      .first()
      .element()
      .getBoundingClientRect();
    const menu = page.getByRole('menu').element().getBoundingClientRect();
    expect(Math.abs(menu.top - trigger.bottom)).toBeLessThan(16);
    expect(Math.abs(menu.left - trigger.left)).toBeLessThan(16);
    // The selection stays.
    await expect.element(checkbox('Select Ada')).toBeChecked();
  });

  it('focuses the search once shown again, for a column header that filters by it', async () => {
    await render(<CrowdedHarness />);
    await checkbox('Select Ada').click();
    await expect.element(bar(1)).toBeVisible();

    await page
      .getByRole('columnheader', { name: 'Name', exact: true })
      .getByRole('button')
      .click();

    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveFocus();
  });
});

describe('DataTableSelectionBar alone', () => {
  function Alone({ withTarget = false }: { withTarget?: boolean }) {
    const selection = useDataTableSelection<Person>({
      rowLabel: (person) => `Select ${person.name}`,
    });
    return (
      <>
        <button type="button">Target</button>
        <DataTableSelectionBar
          count={selection.count}
          onClear={selection.clear}
          {...(withTarget && {
            focusOnEmpty: () =>
              page
                .getByRole('button', { name: 'Target' })
                .element() as HTMLElement,
          })}
        />
        <DataTable
          columns={columns}
          data={people}
          label="People"
          getRowId={(person) => person.id}
          selection={selection}
        />
      </>
    );
  }

  it('gives the focus to the header checkbox of the table once cleared', async () => {
    await render(<Alone />);
    await checkbox('Select Ada').click();

    await bar(1).getByRole('button', { name: 'Clear selection' }).click();

    await expect.element(selectAll()).toHaveFocus();
  });

  it('sits at the end of a column of the page', async () => {
    await render(<Alone />);
    await checkbox('Select Ada').click();

    await expect.element(bar(1)).toBeVisible();
    expect(getComputedStyle(bar(1).element()).alignSelf).toBe('flex-end');
  });

  it('gives the focus where focusOnEmpty says', async () => {
    await render(<Alone withTarget />);
    await checkbox('Select Ada').click();

    await bar(1).getByRole('button', { name: 'Clear selection' }).click();

    await expect
      .element(page.getByRole('button', { name: 'Target' }))
      .toHaveFocus();
  });
});

describe('DataTableToolbar with a selection, shown again for a filter', () => {
  const reveal = async () => {
    await render(<CrowdedHarness />);
    await checkbox('Select Ada').click();
    await page
      .getByRole('columnheader', { name: 'Status', exact: true })
      .getByRole('button')
      .click();
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Active' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(bar(1)).not.toBeInTheDocument();
  };

  it('shows the bar again once another row is ticked, and once it is unticked', async () => {
    await reveal();

    await checkbox('Select Alan').click();
    await expect.element(bar(2)).toBeVisible();
    await checkbox('Select Alan').click();
    await expect.element(bar(1)).toBeVisible();
  });

  it('shows the bar again once the row is unticked and another ticked', async () => {
    await reveal();

    await checkbox('Select Ada').click();
    await checkbox('Select Alan').click();

    await expect.element(bar(1)).toBeVisible();
  });

  it('gives the focus to the bar when an action of the toolbar selects rows', async () => {
    await render(<CrowdedHarness />);

    await page.getByRole('button', { name: 'Pick two' }).click();

    await expect.element(bar(2)).toBeVisible();
    await expect
      .element(bar(2).getByRole('button', { name: 'Archive' }))
      .toHaveFocus();
  });
});

describe('DataTableSelectionBar, where the focus goes once it empties', () => {
  function Nested({ toolbar = false }: { toolbar?: boolean }) {
    const store = useMemoryDataTableStore<Search>();
    const table = useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
    });
    const selection = useDataTableSelection<Person>({
      rowLabel: (person) => `Select ${person.name}`,
    });
    return (
      <div>
        <p>Some text</p>
        {/* Not focusable: it clears the selection without taking the focus. */}
        <span onClick={selection.clear}>Forget</span>
        {toolbar ? (
          // No search, no filter, no action: nothing in the toolbar to take the focus.
          <DataTableToolbar table={table} selection={selection} />
        ) : (
          <div>
            <div>
              <DataTableSelectionBar
                count={selection.count}
                onClear={selection.clear}
              >
                <button type="button">Archive</button>
              </DataTableSelectionBar>
            </div>
          </div>
        )}
        <DataTable
          columns={columns}
          data={people}
          label="People"
          getRowId={(person) => person.id}
          selection={selection}
        />
      </div>
    );
  }

  it('finds the table around the bar, however deep the bar sits', async () => {
    await render(<Nested />);
    await checkbox('Select Ada').click();

    await bar(1).getByRole('button', { name: 'Clear selection' }).click();

    await expect.element(selectAll()).toHaveFocus();
  });

  it('gives it to the table from a toolbar with nothing to focus', async () => {
    await render(<Nested toolbar />);
    await checkbox('Select Ada').click();

    await bar(1).getByRole('button', { name: 'Clear selection' }).click();

    await expect.element(selectAll()).toHaveFocus();
  });

  it('leaves it alone once the user clicked elsewhere on the page', async () => {
    await render(<Nested />);
    await checkbox('Select Ada').click();
    await bar(1).getByRole('button', { name: 'Archive' }).click();
    await page.getByText('Some text').click();
    expect(document.activeElement).toBe(document.body);

    await page.getByText('Forget').click();

    await expect.element(bar(1)).not.toBeInTheDocument();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('DataTable selection from the keyboard', () => {
  it('selects the rows between two with Shift + Space', async () => {
    await render(<Harness />);
    (checkbox('Select Ada').element() as HTMLElement).focus();
    await userEvent.keyboard(' ');
    await expect.element(checkbox('Select Ada')).toBeChecked();

    (checkbox('Select Ken').element() as HTMLElement).focus();
    await userEvent.keyboard('{Shift>} {/Shift}');

    await expect.element(bar(4)).toBeVisible();
    await expect.element(checkbox('Select Linus')).toBeChecked();
    await expect.element(checkbox('Select Grace')).not.toBeChecked();
  });
});

describe('DataTable selection, columns rebuilt on every render', () => {
  function Rebuilt() {
    const selection = useDataTableSelection<Person>({
      rowLabel: (person) => `Select ${person.name}`,
    });
    return (
      <DataTable
        // A new array, and new columns, on every render.
        columns={[{ id: 'name', accessorKey: 'name', title: 'Name' }]}
        data={people}
        label="People"
        getRowId={(person) => person.id}
        selection={selection}
      />
    );
  }

  it('keeps the checkbox ticked with Space, and its focus', async () => {
    await render(<Rebuilt />);
    const ada = checkbox('Select Ada');
    const node = ada.element() as HTMLElement;
    node.focus();

    await userEvent.keyboard(' ');

    await expect.element(ada).toBeChecked();
    expect(ada.element()).toBe(node);
    await expect.element(ada).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(ada).not.toBeChecked();
    expect(ada.element()).toBe(node);
  });
});

describe('DataTable selection, virtual', () => {
  it('names its header checkbox for every row, not those shown', async () => {
    function Virtual() {
      const selection = useDataTableSelection<Person>();
      return (
        <div className="flex h-75 flex-col">
          <DataTable
            columns={columns}
            data={people}
            getRowId={(person) => person.id}
            selection={selection}
            virtual={{ rowHeight: 37 }}
          />
        </div>
      );
    }
    await render(<Virtual />);

    await expect
      .element(
        page.getByRole('checkbox', { name: 'Select all rows', exact: true })
      )
      .toBeVisible();
  });
});

describe('DataTableToolbar with a selection, wrapped over three lines', () => {
  it('keeps the bar one line high, at the top of the cell, and the table in place', async () => {
    await render(
      <div className="w-60">
        <CrowdedHarness />
      </div>
    );
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toBeVisible();
    expect(controls().getBoundingClientRect().height).toBeGreaterThan(90);
    const top = () =>
      page.getByRole('table').element().getBoundingClientRect().top;
    const before = top();

    await checkbox('Select Ada').click();

    await expect.element(bar(1)).toBeVisible();
    const height = bar(1).element().getBoundingClientRect().height;
    expect(height).toBeGreaterThanOrEqual(28);
    expect(height).toBeLessThanOrEqual(44);
    expect(top()).toBe(before);
    // At the bottom of the cell, right above the rows it acts on.
    expect(
      Math.abs(
        bar(1).element().getBoundingClientRect().bottom -
          controls().getBoundingClientRect().bottom
      )
    ).toBeLessThan(1);
  });
});

describe('DataTable selection from a focused row', () => {
  const row = (name: string) =>
    page.getByRole('row', { name: new RegExp(name) });
  const focusRow = async (name: string) => {
    (row(name).element() as HTMLElement).focus();
    await expect.element(row(name)).toHaveFocus();
  };

  it('selects the focused row with Space, and the rows from the last one with Shift + Space', async () => {
    await render(<Harness onRowClick={() => {}} />);
    await focusRow('Ada');

    await userEvent.keyboard(' ');
    await expect.element(checkbox('Select Ada')).toBeChecked();
    await expect.element(row('Ada')).toHaveFocus();

    await focusRow('Ken');
    await userEvent.keyboard('{Shift>} {/Shift}');

    await expect.element(bar(4)).toBeVisible();
    await expect.element(checkbox('Select Linus')).toBeChecked();
    await expect.element(checkbox('Select Grace')).not.toBeChecked();

    await userEvent.keyboard(' ');
    await expect.element(bar(3)).toBeVisible();
    await expect.element(checkbox('Select Ken')).not.toBeChecked();
  });

  it('leaves a row that cannot be selected, and a held Space, alone', async () => {
    await render(<Harness onRowClick={() => {}} />);
    await focusRow('Grace');

    await userEvent.keyboard(' ');
    await expect.element(checkbox('Select Grace')).not.toBeChecked();

    await focusRow('Ada');
    const element = row('Ada').element();
    for (const repeat of [false, true, true])
      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          repeat,
          bubbles: true,
          cancelable: true,
        })
      );
    await expect.element(bar(1)).toBeVisible();
    await expect.element(checkbox('Select Ada')).toBeChecked();
  });

  it('tells assistive tech Space selects a row', async () => {
    await render(<Harness onRowClick={() => {}} />);

    await expect
      .element(row('Ada'))
      .toHaveAccessibleDescription(
        'Enter opens a row, Space selects it; the arrow keys move between rows.'
      );
  });
});
