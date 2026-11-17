import type { Meta } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default {
  title: 'DataTable/Overview',
} satisfies Meta;

// The id Storybook gives an export: `UrlState` is `url-state`.
const storyId = (name: string) =>
  name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-xs">
    {children}
  </code>
);

const layers = [
  {
    name: 'Store',
    parts: ['useMemoryDataTableStore', 'useRouterDataTableStore'],
    role: 'Where the state lives: in memory, or in the URL through TanStack Router. A store with addresses turns the pages into links.',
  },
  {
    name: 'State',
    parts: ['useDataTable', 'useRouterDataTable'],
    role: 'The page, size, search, sorting, hidden columns and typed filters, with one history entry per run of changes. Headless: it renders nothing.',
  },
  {
    name: 'Parts',
    parts: [
      'DataTable',
      'DataTableToolbar',
      'DataTablePagination',
      'DataTableColumnVisibility',
      'DataTableSelectionBar',
    ],
    role: 'What renders: each takes what useDataTable answers as `table`.',
  },
  {
    name: 'Filters',
    parts: ['selectFilter', 'multiSelectFilter', 'DataTableFilterPopover'],
    role: 'One per filter field of the state, typed by it. A filter of your own is an object with a summary and an editor.',
  },
  {
    name: 'States',
    parts: [
      'DataTableEmptyState',
      'DataTableLoadingState',
      'DataTableErrorState',
      'DataTableLoadMore',
    ],
    role: 'What the body shows with no row (the `empty` slot), and the footer of a table that loads in batches.',
  },
  {
    name: 'Primitives',
    parts: ['Table', 'TableHeader', 'TableRow', 'TableHead', 'TableCell'],
    role: 'The styled table elements, with their variants (sticky, align, shrink). For a static table, use them alone.',
  },
] as const;

const choices = [
  [
    'The state in the URL',
    'useRouterDataTable, and dataTableSearchSchema as the route’s validateSearch',
    'UrlState',
  ],
  [
    'The state in memory',
    'useDataTable with useMemoryDataTableStore',
    'SearchAndFilters',
  ],
  [
    'Pages',
    'DataTablePagination in the `footer`, with `total` and `busy` while the next page loads',
    'Paginated',
  ],
  ['Batches', 'DataTableLoadMore in the `footer`', 'LoadMore'],
  [
    'Thousands of rows at once',
    '`virtual` on DataTable, its parent bounding its height',
    'Virtualized',
  ],
  [
    'Bulk actions',
    'useDataTableSelection, `selection` and `getRowId` on DataTable, the selection on DataTableToolbar',
    'RowSelection',
  ],
  [
    'A row that opens something',
    '`onRowClick` on DataTable',
    'RowClickAndActions',
  ],
  [
    'A filter of your own',
    'an object of type DataTableFilter: `summary` and `editor`',
    'CustomFilter',
  ],
] as const;

const props = [
  [
    'DataTable',
    'table, columns, data, label, getRowId, empty, footer, selection, onRowClick, virtual, busy',
  ],
  [
    'DataTableColumn',
    'id, accessorKey, title, cell, sortable, filter, align, size, shrink, sticky, columns (a group)',
  ],
  ['useDataTable', 'store, defaultSorting, defaultPageSize, filters'],
  [
    'DataTableToolbar',
    'table, search, selection, selectionActions, children (the app’s actions)',
  ],
  [
    'DataTablePagination',
    'table, total or pages, pageSizes, results, busy, aria-label',
  ],
  [
    'useDataTableSelection',
    'rowLabel, canSelect, matching or resetOn, initial',
  ],
] as const;

// How the pieces fit, and which to reach for: the examples show each in code.
export const Overview = () => {
  return (
    <article className="flex max-w-3xl flex-col gap-6 text-sm">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">DataTable</h1>
        <p className="text-muted-foreground">
          A table that sorts, searches, filters, pages and selects, its state in
          memory or in the URL. It comes in layers: take the ones you need.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Layers</h2>
        <ol className="flex flex-col gap-3">
          {layers.map((layer) => (
            <li key={layer.name} className="flex flex-col gap-1">
              <span className="font-medium">{layer.name}</span>
              <span className="flex flex-wrap gap-1">
                {layer.parts.map((part) => (
                  <Code key={part}>{part}</Code>
                ))}
              </span>
              <span className="text-muted-foreground">{layer.role}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Which to reach for</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>For</TableHead>
              <TableHead>Use</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {choices.map(([need, use, story]) => (
              <TableRow key={need}>
                <TableCell>{need}</TableCell>
                <TableCell wrap tone="muted">
                  {use}
                </TableCell>
                <TableCell>
                  {/* The page around the preview, which the link leaves for the example. */}
                  <a
                    href={`/?path=/story/datatable-examples--${storyId(story)}`}
                    target="_top"
                    className="font-mono text-xs underline underline-offset-4"
                  >
                    {story}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Main props</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead>Props</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.map(([part, list]) => (
              <TableRow key={part}>
                <TableCell>
                  <Code>{part}</Code>
                </TableCell>
                <TableCell wrap tone="muted">
                  {list}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Good to know</h2>
        <ul className="flex list-disc flex-col gap-1 ps-5 text-muted-foreground">
          <li>
            Declare the columns outside the component, or memoize them: new
            columns on every render remount every cell.
          </li>
          <li>
            Give <Code>getRowId</Code> whenever the rows have ids: selection
            needs it, and the rows scroll back to the top when other ones show.
          </li>
          <li>
            The table is as tall as its rows, up to the height its parent gives
            it (a flex column with a height): past it, the rows scroll under the
            header. Give it <Code>flex-1</Code> only to fill that height
            whatever the rows.
          </li>
          <li>
            Give the columns of text a <Code>size</Code>, a width in pixels at
            least: rows narrower keep it from one page to the next (a longer
            value still widens it, as cells do not wrap).
          </li>
          <li>
            Share one <Code>pageSizes</Code> constant between the search schema
            and the pagination.
          </li>
          <li>
            Selection that outlives a filter: pass the ids that match as{' '}
            <Code>matching</Code>, or <Code>resetOn: table.filtersKey</Code>{' '}
            when only one page is known.
          </li>
        </ul>
      </section>
    </article>
  );
};
