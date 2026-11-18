import { DirectionProvider } from '@base-ui/react/direction-provider';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DataTableColumnVisibility } from '@/components/ui/data-table/column-visibility';
import {
  DataTable,
  type DataTableColumnFor,
} from '@/components/ui/data-table/data-table';
import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import { useDataTableSelection } from '@/components/ui/data-table/selection';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

import { render } from '@/tests/utils';

type Person = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly team: string;
  readonly city: string;
  readonly net: number;
  readonly gross: number;
};
type State = {
  readonly page?: number | undefined;
  readonly orderBy?: 'name' | undefined;
  readonly dir?: 'asc' | 'desc' | undefined;
  readonly hidden?: ReadonlyArray<string> | undefined;
  readonly pinned?: ReadonlyArray<string> | undefined;
};

const titled = (
  id: Exclude<keyof Person, 'id' | 'net' | 'gross'>,
  title: string
) => ({ id, accessorKey: id, title }) as const;

const columns: ReadonlyArray<DataTableColumnFor<Person, State>> = [
  titled('name', 'Name'),
  titled('email', 'Email'),
  titled('role', 'Role'),
  titled('team', 'Team'),
  titled('city', 'City'),
  {
    id: 'prices',
    title: 'Price',
    columns: [
      { id: 'net', accessorKey: 'net', title: 'Excl. VAT' },
      { id: 'gross', accessorKey: 'gross', title: 'Incl. VAT' },
    ],
  },
];

const people: ReadonlyArray<Person> = [
  {
    id: 'p-1',
    name: 'Ada Lovelace of the Analytical Engine',
    email: 'ada.lovelace@analytical-engine.example',
    role: 'Mathematician and first programmer',
    team: 'Difference Engine research team',
    city: 'London, United Kingdom of Great Britain',
    net: 100,
    gross: 120,
  },
];

function People({
  initial = {},
  selectable = false,
}: {
  initial?: State;
  selectable?: boolean;
}) {
  const store = useMemoryDataTableStore<State>(initial);
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  const selection = useDataTableSelection<Person>();
  return (
    <>
      <DataTableColumnVisibility table={table} columns={columns} />
      <output aria-label="State">{JSON.stringify(table.state)}</output>
      <div className="flex h-75 w-150 flex-col">
        <DataTable
          table={table}
          columns={columns}
          data={people}
          getRowId={(person) => person.id}
          {...(selectable && { selection })}
        />
      </div>
    </>
  );
}

const header = (name: string) =>
  page
    .getByRole('columnheader', { name, exact: true })
    .element() as HTMLElement;
/** The headers of the first header row, in their order: the columns outside a group, and the groups. */
const order = () => document.querySelectorAll('thead tr:first-child th');
const viewport = () => {
  const element = document.querySelector('[data-slot=data-table-viewport]');
  if (!(element instanceof HTMLElement)) throw new Error('No viewport.');
  return element;
};
const state = () => page.getByRole('status', { name: 'State' });
const box = (name: string) => header(name).getBoundingClientRect();
// The line a pinned cell draws on its end side: a horizontal inset shadow, unlike the line under the header.
const endEdge = { ltr: /\) -1px 0px 0px/, rtl: /\) 1px 0px 0px/ };

describe('DataTable pinned columns', () => {
  it('pins columns from the menu, which stays open, in the order they were pinned', async () => {
    await render(<People />);
    await page.getByRole('button', { name: 'Columns' }).click();

    await page.getByRole('menuitemcheckbox', { name: 'Pin Email' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Pin Role' }).click();

    await expect
      .element(state())
      .toHaveTextContent(JSON.stringify({ pinned: ['email', 'role'] }));
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Pin Role' }))
      .toBeChecked();
    const titles = [...(order() ?? [])].map((cell) => cell.textContent);
    expect(titles.slice(0, 3)).toEqual(['Email', 'Role', 'Name']);
  });

  it('offers no pin for a column of a group, and ignores a pin on one', async () => {
    await render(<People initial={{ pinned: ['net'] }} />);
    await page.getByRole('button', { name: 'Columns' }).click();

    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Pin Name' }))
      .toBeVisible();
    expect(
      page.getByRole('menuitemcheckbox', { name: /^Pin .*VAT/ }).elements()
    ).toHaveLength(0);
    expect(getComputedStyle(header('Excl. VAT')).position).not.toBe('sticky');
    expect(order()?.[0]?.textContent).not.toBe('Excl. VAT');
  });

  it('holds the pinned columns, after the checkboxes, while the others slide under them', async () => {
    await render(<People initial={{ pinned: ['name', 'email'] }} selectable />);
    const select = page
      .getByRole('checkbox', { name: 'Select all rows shown' })
      .element()
      .closest('th') as HTMLElement;
    await expect.element(header('Name')).toBeVisible();

    // Each pinned column starts where the one before it ends, the checkboxes first.
    await expect
      .poll(() => box('Name').left - select.getBoundingClientRect().right)
      .toBeCloseTo(0, 0);
    expect(box('Email').left - box('Name').right).toBeCloseTo(0, 0);
    expect(getComputedStyle(header('Email')).boxShadow).not.toMatch(
      endEdge.ltr
    );
    const [selectLeft, nameLeft, emailLeft, roleLeft] = [
      select.getBoundingClientRect().left,
      box('Name').left,
      box('Email').left,
      box('Role').left,
    ];

    viewport().scrollLeft = 200;

    await expect.poll(() => box('Role').left).toBeLessThan(roleLeft);
    // In place, to the subpixel the sticky position rounds to.
    expect(select.getBoundingClientRect().left).toBeCloseTo(selectLeft, 0);
    expect(box('Name').left).toBeCloseTo(nameLeft, 0);
    expect(box('Email').left).toBeCloseTo(emailLeft, 0);
    await expect
      .poll(() => getComputedStyle(header('Email')).boxShadow)
      .toMatch(endEdge.ltr);
    expect(getComputedStyle(header('Name')).boxShadow).not.toMatch(endEdge.ltr);
  });

  it('holds them at the right edge, right to left', async () => {
    await render(
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <People initial={{ pinned: ['name'] }} />
        </div>
      </DirectionProvider>
    );
    await expect.element(header('Name')).toBeVisible();
    await expect
      .poll(() => viewport().getBoundingClientRect().right - box('Name').right)
      .toBeLessThan(2);
    const [nameLeft, emailRight] = [box('Name').left, box('Email').right];
    expect(getComputedStyle(header('Name')).boxShadow).not.toMatch(endEdge.rtl);

    viewport().scrollLeft = -200;

    await expect.poll(() => box('Email').right).toBeGreaterThan(emailRight);
    expect(box('Name').left).toBeCloseTo(nameLeft, 0);
    await expect
      .poll(() => getComputedStyle(header('Name')).boxShadow)
      .toMatch(endEdge.rtl);
  });
});
