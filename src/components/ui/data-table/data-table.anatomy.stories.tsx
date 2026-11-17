import type { Meta } from '@storybook/react-vite';
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

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
  /** In a popup (an editor): outlined above it, while the outlines of the table stay under every popup. */
  readonly popup?: true;
  /** Inside the part above it, as `filter.summary` inside `DataTableFilterChip`: indented in the legend. */
  readonly depth?: 1;
  /** The corner of its number: an end one for the parts that hold others, whose top start is taken. */
  readonly corner?: 'end' | 'bottom-start' | 'bottom-end';
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
    corner: 'bottom-start',
    role: 'A filter shown: its title, its value, its editor (here a selectFilter), its remove button.',
    find: (root) => root.querySelector('[data-slot=data-table-filter-chip]'),
  },
  {
    name: 'filter.title',
    depth: 1,
    role: 'The name of the filter (`DataTableFilter.title`), before its value.',
    find: (root) => root.querySelector('[data-slot=data-table-filter-title]'),
  },
  {
    name: 'filter.summary(value)',
    depth: 1,
    role: 'What the filter holds, in short; its `placeholder` while empty.',
    find: (root) => root.querySelector('[data-slot=data-table-filter-summary]'),
  },
  {
    name: 'trigger',
    corner: 'end',
    depth: 1,
    role: 'The chip’s button, which the editor spreads on the trigger of its popup.',
    find: (root) => root.querySelector('[data-slot=data-table-filter-trigger]'),
  },
  {
    name: 'filter.editor(props)',
    popup: true,
    depth: 1,
    corner: 'end',
    role: 'The popup that edits the value: a menu for selectFilter and multiSelectFilter, your own form for a custom filter (DataTableFilterPopover). Open it with the scenario above.',
    // Rendered in a portal, outside the table.
    find: () =>
      document.querySelector(
        '[data-slot=dropdown-menu-content], [data-slot=popover-content]'
      ),
  },
  {
    name: 'DataTableFilterOption',
    popup: true,
    corner: 'bottom-start',
    depth: 1,
    role: 'An option of the editor (`options` of selectFilter): its `label`, its `count`.',
    find: () =>
      document.querySelector(
        '[data-slot=dropdown-menu-content] [role=menuitemradio], [data-slot=dropdown-menu-content] [role=menuitemcheckbox]'
      ),
  },
  {
    name: 'onRemove',
    corner: 'end',
    depth: 1,
    role: 'The chip’s remove button: the filter and its value go.',
    find: (root) => root.querySelector('[data-slot=data-table-filter-remove]'),
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
        const next: ReadonlyArray<Box> = parts.flatMap((part, index) => {
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
              // In the viewport: the overlay is fixed, above the page and its popups. Whole pixels, so a measure
              // that finds nothing moved is the same measure.
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          ];
        });
        // Stored only when something moved: a render of the story changes the page (Base UI sets attributes of its
        // inputs), which would measure again, and render again, without end.
        setBoxes((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next
        );
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    // The overlay's own changes say nothing of the table.
    const mutation = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            !(record.target instanceof Element) ||
            record.target.closest('[data-anatomy-overlay]') === null
        )
      )
        measure();
    });
    // The body, not only the table: an editor opens in a portal.
    mutation.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
    });
    document.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      document.removeEventListener('scroll', measure, true);
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

type Scenario = 'default' | 'editor' | 'selection';

const scenarios: ReadonlyArray<{
  readonly id: Scenario;
  readonly label: string;
}> = [
  { id: 'default', label: 'The table' },
  { id: 'editor', label: 'The editor of a filter, open' },
  { id: 'selection', label: 'Rows selected' },
];

/**
 * A live table, each part outlined and numbered with the name the code gives it. Hover a name to find its part; pick a
 * scenario to see the parts that only show in it: the editor of a filter, the bar of a selection.
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
  const [scenario, setScenario] = React.useState<Scenario>('default');
  // Each scenario brings out the parts that only show in it: the editor of a filter, the bar of a selection.
  const show = (next: Scenario) => {
    setScenario(next);
    selection.onSelectedChange(
      new Set(
        next === 'selection' ? rows.slice(0, 2).map((user) => user.id) : []
      )
    );
    table.toolbar.chips
      .find((chip) => chip.key === 'status')
      ?.onOpenChange(next === 'editor');
  };

  // Two layers: the table's parts under any popup, so a popup stays on top; a popup's own parts over it.
  const layer = (popupLayer: boolean) => {
    const layerBoxes = boxes.filter(
      (box) => (parts[box.index]?.popup === true) === popupLayer
    );
    return createPortal(
      <div
        aria-hidden
        data-anatomy-overlay
        className={cn(
          'pointer-events-none fixed inset-0 isolate',
          // Under popups (z-50), but for the parts of a popup, drawn over it.
          popupLayer ? 'z-60' : 'z-40'
        )}
      >
        {layerBoxes.map((box) => (
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
        {layerBoxes.map((box) => (
          <span
            key={box.index}
            // On a corner of its box: the start one, or the end one for a part that holds others.
            style={
              {
                '--x': `${parts[box.index]?.corner?.endsWith('end') === true ? box.x + box.width : box.x}px`,
                '--y': `${parts[box.index]?.corner?.startsWith('bottom') === true ? box.y + box.height : box.y}px`,
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
      </div>,
      document.body
    );
  };

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
        {/* In a portal, fixed: above everything, the table's sticky parts and an editor's popup included. The outlines,
            then all the numbers over them, so no outline hides a number. */}
        {layer(false)}
        {layer(true)}
      </div>

      <aside className="flex flex-col gap-3 text-sm lg:w-80">
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 font-medium">Show</legend>
          {scenarios.map((option) => (
            <label key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="anatomy-scenario"
                checked={scenario === option.id}
                onChange={() => show(option.id)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
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
                  part.depth === 1 && 'ms-6',
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
