import type { Meta } from '@storybook/react-vite';
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { DataTableColumnVisibility } from '@/components/ui/data-table/column-visibility';
import {
  DataTable,
  type DataTableColumnFor,
} from '@/components/ui/data-table/data-table';
import {
  queryUsers,
  type User,
  userStatuses,
} from '@/components/ui/data-table/data-table.fixtures';
import { selectFilter } from '@/components/ui/data-table/filters/select-filter';
import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { useDataTableSelection } from '@/components/ui/data-table/selection';
import type { DataTableBaseState } from '@/components/ui/data-table/state';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

export default {
  title: 'DataTable/Anatomy',
} satisfies Meta;

type Part = {
  /** The name of the part in the code: the component, or the variant of a primitive. */
  readonly name: string;
  readonly role: string;
  /** Finds the part in the live table, by its `data-slot`. */
  readonly find: (root: HTMLElement) => Element | null | undefined;
  /** The corner of its number: an end one for the parts that hold others, whose top start is taken. */
  readonly corner?: 'end' | 'bottom-end';
};

const all = (root: HTMLElement, selector: string) => [
  ...root.querySelectorAll(selector),
];

// Each part of a table, named as the code names it, so the design, the code and the talk share one vocabulary.
const parts: ReadonlyArray<Part> = [
  {
    name: 'DataTableToolbar',
    corner: 'end',
    role: 'Above the table: the search, the filters, the app’s actions.',
    find: (root) => root.querySelector('[data-slot=data-table-toolbar]'),
  },
  {
    name: 'SearchInput',
    role: 'The search of the toolbar (`search`), sent as the user types.',
    find: (root) =>
      root.querySelector(
        '[data-slot=data-table-toolbar] [data-slot=input-group]'
      ),
  },
  {
    name: 'DataTableAddFilter',
    role: 'Offers the filters not shown yet.',
    find: (root) => root.querySelector('[data-slot=data-table-add-filter]'),
  },
  {
    name: 'DataTableFilterChip',
    role: 'A filter shown: its title, its value, its editor (here a selectFilter), its remove button.',
    find: (root) => root.querySelector('[data-slot=data-table-filter-chip]'),
  },
  {
    name: 'DataTableColumnVisibility',
    role: 'Shows, hides and pins the columns.',
    find: (root) =>
      root.querySelector('[data-slot=data-table-column-visibility]'),
  },
  {
    name: 'DataTableSelectionBar',
    role: 'Takes the toolbar’s place while rows are selected: how many, the bulk actions.',
    find: (root) =>
      root.querySelector('[data-slot=data-table-selection-bar]:not([hidden])'),
  },
  {
    name: 'DataTable',
    corner: 'bottom-end',
    role: 'The table itself: its header, its rows in a scroll area, its footer.',
    find: (root) => root.querySelector('[data-slot=data-table]'),
  },
  {
    name: 'TableHeader sticky',
    corner: 'end',
    role: 'The header row, held at the top while the rows scroll.',
    find: (root) => root.querySelector('[data-slot=table-header]'),
  },
  {
    name: 'DataTableColumnHeader',
    role: 'The header of a column: sorts it, or opens its filter.',
    find: (root) => root.querySelector('[data-slot=data-table-column-header]'),
  },
  {
    name: 'SelectAllCheckbox',
    role: 'Selects or clears every row shown.',
    find: (root) => root.querySelector('[data-slot=data-table-select-all]'),
  },
  {
    name: 'SelectRowCheckbox',
    role: 'Selects a row; Shift selects a range.',
    find: (root) => root.querySelector('[data-slot=data-table-select-row]'),
  },
  {
    name: 'TableRow',
    corner: 'end',
    role: 'A row of data (`data`, keyed by `getRowId`).',
    find: (root) => root.querySelector('tbody [data-slot=table-row]'),
  },
  {
    name: 'TableCell sticky="start"',
    role: 'A pinned column (`pinned`): held at the start while the others scroll.',
    // The checkbox column sticks with the pinned ones: the pinned column is the last of them.
    find: (root) =>
      all(root, 'tbody tr:first-child [data-sticky=start]').at(-1),
  },
  {
    name: 'TableCell',
    role: 'A cell: what the column’s `cell` renders, or its value.',
    find: (root) =>
      root.querySelector(
        'tbody tr:first-child [data-slot=table-cell]:not([data-sticky])'
      ),
  },
  {
    name: 'TableCell sticky="end"',
    role: "A column with `sticky: 'end'`, such as the actions of a row.",
    find: (root) =>
      root.querySelector('tbody tr:first-child [data-sticky=end]'),
  },
  {
    name: 'footer',
    corner: 'end',
    role: 'The slot below the rows: the pagination, or DataTableLoadMore.',
    find: (root) => root.querySelector('[data-slot=data-table-footer]'),
  },
  {
    name: 'DataTablePagination',
    role: 'The count, the page size, the pages.',
    find: (root) => root.querySelector('[data-slot=data-table-pagination]'),
  },
];

type Box = {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** Where each part shows in `root`, measured again whenever the table changes, scrolls or resizes. */
const useBoxes = (root: React.RefObject<HTMLDivElement | null>) => {
  const [boxes, setBoxes] = React.useState<ReadonlyArray<Box>>([]);
  React.useLayoutEffect(() => {
    const element = root.current;
    if (element === null) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const origin = element.getBoundingClientRect();
        setBoxes(
          parts.flatMap((part, index) => {
            const found = part.find(element);
            if (
              found === null ||
              found === undefined ||
              !found.checkVisibility({ visibilityProperty: true })
            )
              return [];
            const rect = found.getBoundingClientRect();
            return [
              {
                index,
                x: rect.x - origin.x,
                y: rect.y - origin.y,
                width: rect.width,
                height: rect.height,
              },
            ];
          })
        );
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const mutation = new MutationObserver(measure);
    mutation.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
    });
    element.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      element.removeEventListener('scroll', measure, true);
    };
  }, [root]);
  return boxes;
};

type Column = 'name' | 'status' | 'orders';
type State = DataTableBaseState<Column> & {
  readonly status?: User['status'] | undefined;
};

const filters = {
  status: selectFilter({
    title: 'Status',
    options: userStatuses.map((value) => ({ value, label: value })),
  }),
};

const columns: ReadonlyArray<DataTableColumnFor<User, State>> = [
  { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
  { id: 'email', accessorKey: 'email', title: 'Email', filter: 'search' },
  {
    id: 'status',
    accessorKey: 'status',
    title: 'Status',
    sortable: true,
    filter: 'status',
  },
  {
    id: 'orders',
    accessorKey: 'orders',
    title: 'Orders',
    sortable: true,
    align: 'end',
  },
  {
    id: 'actions',
    sticky: 'end',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Actions for ${row.original.name}`}
      >
        <MoreHorizontalIcon />
      </Button>
    ),
  },
];

/**
 * A live table, each part outlined and numbered with the name the code gives it. Hover a name to find its part; tick
 * "With a selection" to see the bar that takes the toolbar's place.
 */
export const Anatomy = () => {
  const store = useMemoryDataTableStore<State>({
    status: 'active',
    pinned: ['name'],
  });
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    defaultPageSize: 5,
    filters,
  });
  const rows = queryUsers(table.state);
  const selection = useDataTableSelection<User>({
    matching: rows.map((user) => user.id),
  });
  const root = React.useRef<HTMLDivElement>(null);
  const boxes = useBoxes(root);
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div
        ref={root}
        className="relative min-w-0 flex-1 self-start lg:sticky lg:top-4"
      >
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            table={table}
            search={{
              'aria-label': 'Search users',
              placeholder: 'Search by name or email',
            }}
            selection={selection}
            selectionActions={
              <Button variant="destructive-secondary" size="xs">
                <Trash2Icon />
                Delete
              </Button>
            }
          >
            <DataTableColumnVisibility table={table} columns={columns} />
          </DataTableToolbar>
          <DataTable
            table={table}
            columns={columns}
            data={rows.slice(
              (table.page - 1) * table.pageSize,
              table.page * table.pageSize
            )}
            label="Users"
            getRowId={(user) => user.id}
            selection={selection}
            footer={
              <DataTablePagination
                table={table}
                total={rows.length}
                pageSizes={[5, 10]}
                results={`${rows.length} users`}
                aria-label="Pages of users"
              />
            }
          />
        </div>
        {/* Over the live table, and through it to the pointer: the table stays usable. */}
        {/* Above everything the table stacks (its sticky header, its shades): the outlines, then all the numbers over
            them, so no outline hides a number. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 isolate z-50"
        >
          {boxes.map((box) => (
            <div
              key={box.index}
              style={
                {
                  '--x': `${box.x}px`,
                  '--y': `${box.y}px`,
                  '--w': `${box.width}px`,
                  '--h': `${box.height}px`,
                } as React.CSSProperties
              }
              className={cn(
                'absolute top-(--y) left-(--x) h-(--h) w-(--w) rounded-sm border border-dashed border-chart-1 transition-opacity motion-reduce:transition-none',
                active === box.index && 'border-2 border-solid bg-chart-1/10',
                active !== null && active !== box.index && 'opacity-15'
              )}
            />
          ))}
          {boxes.map((box) => (
            <span
              key={box.index}
              // On a corner of its box: the start one, or the end one for a part that holds others.
              style={
                {
                  '--x': `${parts[box.index]?.corner === undefined ? box.x : box.x + box.width}px`,
                  '--y': `${parts[box.index]?.corner === 'bottom-end' ? box.y + box.height : box.y}px`,
                } as React.CSSProperties
              }
              className={cn(
                'absolute top-(--y) left-(--x) flex size-5 -translate-1/2 items-center justify-center rounded-full bg-chart-1 text-xs leading-none font-semibold text-white ring-2 ring-background transition-opacity motion-reduce:transition-none',
                active !== null && active !== box.index && 'opacity-15'
              )}
            >
              {box.index + 1}
            </span>
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-3 text-sm lg:w-80">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selection.count > 0}
            onChange={(event) =>
              selection.onSelectedChange(
                new Set(
                  event.target.checked
                    ? rows.slice(0, 2).map((user) => user.id)
                    : []
                )
              )
            }
          />
          With a selection
        </label>
        <ol className="flex flex-col gap-1">
          {parts.map((part, index) => {
            const shown = boxes.some((box) => box.index === index);
            return (
              <li
                key={part.name}
                tabIndex={0}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className={cn(
                  'flex gap-2 rounded-md p-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                  !shown && 'opacity-50'
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-chart-1 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="flex flex-col gap-0.5">
                  <code className="font-mono text-xs font-semibold">
                    {part.name}
                  </code>
                  <span className="text-muted-foreground">{part.role}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
};
