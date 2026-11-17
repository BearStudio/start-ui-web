import { getUiState } from '@bearstudio/ui-state';
import type { Meta } from '@storybook/react-vite';
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import {
  CopyIcon,
  EllipsisIcon,
  MailIcon,
  PencilLineIcon,
  RotateCwIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { dataTableSearchSchema } from '@/components/data-table/search-schema';
import { useRouterDataTable } from '@/components/data-table/use-router-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnVisibility } from '@/components/ui/data-table/column-visibility';
import {
  DataTable,
  type DataTableColumn,
  type DataTableColumnFor,
} from '@/components/ui/data-table/data-table';
import {
  type FakeNetwork,
  fetchTags,
  fetchUsersPage,
  makeUsers,
  type Order,
  orders,
  queryUsers,
  type User,
  users,
  userStatuses,
  userTags,
} from '@/components/ui/data-table/data-table.fixtures';
import {
  type DataTableFilter,
  type DataTableFilterEditorProps,
  DataTableFilterPopover,
} from '@/components/ui/data-table/filters/filter';
import { multiSelectFilter } from '@/components/ui/data-table/filters/multi-select-filter';
import { selectFilter } from '@/components/ui/data-table/filters/select-filter';
import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { useDataTableSelection } from '@/components/ui/data-table/selection';
import type { DataTableBaseState } from '@/components/ui/data-table/state';
import {
  DataTableEmptyState,
  DataTableErrorState,
  DataTableLoadingState,
  DataTableLoadMore,
} from '@/components/ui/data-table/states';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';
import { useDataTable } from '@/components/ui/data-table/use-data-table';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Each story holds all the code of its table, so the Code panel shows it whole: its columns too, memoized in place. In
// an app, declare them outside the component or memoize them: columns made anew rebuild the table, and remount every
// cell, on every render.
// Only the fake data and the fake API (`queryUsers`) live in `data-table.fixtures.ts`.
export default {
  title: 'DataTable/Examples',
} satisfies Meta;

export const Default = () => {
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumn<User>> => [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      { id: 'status', accessorKey: 'status', title: 'Status' },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={users.slice(0, 6)}
      label="Users"
      getRowId={(user) => user.id}
    />
  );
};

export const EmptyState = () => {
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumn<User>> => [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      { id: 'email', accessorKey: 'email', title: 'Email' },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={[]}
      label="Users"
      empty={<DataTableEmptyState />}
    />
  );
};

export const EmptySearchState = () => {
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumn<User>> => [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      { id: 'email', accessorKey: 'email', title: 'Email' },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={[]}
      label="Users"
      empty={
        <DataTableEmptyState
          searchTerm="zorglub"
          onReset={() => alert('table.reset()')}
        />
      }
    />
  );
};

export const LoadingState = () => {
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumn<User>> => [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      { id: 'email', accessorKey: 'email', title: 'Email' },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={[]}
      label="Users"
      empty={<DataTableLoadingState />}
    />
  );
};

export const ErrorState = () => {
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumn<User>> => [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      { id: 'email', accessorKey: 'email', title: 'Email' },
    ],
    []
  );
  const [retrying, setRetrying] = useState(false);

  return (
    <DataTable
      columns={columns}
      data={[]}
      label="Users"
      empty={
        <DataTableErrorState
          title="Could not load the users"
          retry={() => {
            setRetrying(true);
            setTimeout(() => setRetrying(false), 1000);
          }}
          retrying={retrying}
        >
          The server did not answer.
        </DataTableErrorState>
      }
    />
  );
};

export const Sorting = () => {
  type Column = 'name' | 'status' | 'orders';
  type State = DataTableBaseState<Column>;

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      { id: 'status', accessorKey: 'status', title: 'Status', sortable: true },
      {
        id: 'orders',
        accessorKey: 'orders',
        title: 'Orders',
        sortable: true,
        align: 'end',
      },
    ],
    []
  );

  const store = useMemoryDataTableStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });

  return (
    <div className="flex h-96 flex-col">
      <DataTable
        table={table}
        columns={columns}
        data={queryUsers(table.state)}
        label="Users"
        getRowId={(user) => user.id}
      />
    </div>
  );
};

export const Paginated = () => {
  type Column = 'name' | 'status' | 'orders';
  type State = DataTableBaseState<Column>;

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      { id: 'status', accessorKey: 'status', title: 'Status', sortable: true },
      {
        id: 'orders',
        accessorKey: 'orders',
        title: 'Orders',
        sortable: true,
        align: 'end',
      },
    ],
    []
  );

  const store = useMemoryDataTableStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  const rows = queryUsers(table.state);

  // A paged table is as tall as its rows, up to the height it is given: past it, they scroll inside, under the header
  // and above the pages.
  return (
    <div className="flex h-svh flex-col p-4">
      <DataTable
        table={table}
        columns={columns}
        data={rows.slice(
          (table.page - 1) * table.pageSize,
          table.page * table.pageSize
        )}
        label="Users"
        getRowId={(user) => user.id}
        footer={
          <DataTablePagination
            table={table}
            total={rows.length}
            pageSizes={[10, 25, 50]}
            results={`${rows.length} ${rows.length === 1 ? 'user' : 'users'}`}
            aria-label="Pages of users"
          />
        }
      />
    </div>
  );
};
Paginated.parameters = { layout: 'fullscreen' };

export const LoadMore = () => {
  type Column = 'name' | 'status' | 'orders';
  type State = DataTableBaseState<Column>;
  const batchSize = 10;

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      { id: 'status', accessorKey: 'status', title: 'Status', sortable: true },
      {
        id: 'orders',
        accessorKey: 'orders',
        title: 'Orders',
        sortable: true,
        align: 'end',
      },
    ],
    []
  );

  const store = useMemoryDataTableStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  // In an app, `useInfiniteQuery` keeps the batches and the cursor; here, a count stands for them.
  const [loaded, setLoaded] = useState(batchSize);
  const [loading, setLoading] = useState(false);
  const rows = queryUsers(table.state);

  // No height bound: the table grows with each batch, and the page scrolls, not the table.
  return (
    <DataTable
      table={table}
      columns={columns}
      data={rows.slice(0, loaded)}
      label="Users"
      getRowId={(user) => user.id}
      footer={
        <DataTableLoadMore
          loaded={Math.min(loaded, rows.length)}
          total={rows.length}
          hasMore={loaded < rows.length}
          loading={loading}
          onLoadMore={() => {
            setLoading(true);
            setTimeout(() => {
              setLoaded((count) => count + batchSize);
              setLoading(false);
            }, 600);
          }}
        />
      }
    />
  );
};

export const SearchAndFilters = () => {
  type Column = 'name' | 'status' | 'orders';
  type Filters = {
    readonly status?: User['status'] | undefined;
    readonly tags?: ReadonlyArray<User['tags'][number]> | undefined;
  };
  type State = DataTableBaseState<Column> & Filters;

  const filters = {
    status: selectFilter({
      title: 'Status',
      options: userStatuses.map((value) => ({ value, label: value })),
    }),
    tags: multiSelectFilter({
      title: 'Tags',
      options: userTags.map((value) => ({ value, label: value })),
    }),
  };

  // `filter` adds "Filter" to the menu of the header: it opens that filter of the toolbar, or focuses its search.
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      {
        id: 'name',
        accessorKey: 'name',
        title: 'Name',
        sortable: true,
        filter: 'search',
      },
      {
        id: 'email',
        accessorKey: 'email',
        title: 'Email',
        filter: 'search',
      },
      {
        id: 'status',
        accessorKey: 'status',
        title: 'Status',
        sortable: true,
        filter: 'status',
      },
      {
        id: 'tags',
        title: 'Tags',
        filter: 'tags',
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'orders',
        accessorKey: 'orders',
        title: 'Orders',
        sortable: true,
        align: 'end',
      },
    ],
    []
  );

  const store = useMemoryDataTableStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    filters,
  });
  const rows = queryUsers(table.state);

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        search={{
          'aria-label': 'Search users',
          placeholder: 'Search by name or email',
        }}
      >
        <DataTableColumnVisibility table={table} columns={columns} />
      </DataTableToolbar>
      <DataTable
        table={table}
        columns={columns}
        data={rows}
        label="Users"
        getRowId={(user) => user.id}
        empty={
          <DataTableEmptyState
            searchTerm={table.state.q}
            filtered={table.isFiltered}
            onReset={table.reset}
          />
        }
      />
    </div>
  );
};

export const AsyncFilterOptions = () => {
  type Column = 'name';
  type Filters = { readonly status?: string | undefined };
  type State = DataTableBaseState<Column> & Filters;

  // In an app, the options come from `useQuery`: pass `loading={query.isFetching}` and, on error, `error={{ retry }}`.
  const [options, setOptions] = useState<'loading' | 'error' | 'ready'>(
    'loading'
  );
  const filters = {
    status: selectFilter({
      title: 'Status',
      options:
        options === 'ready'
          ? userStatuses.map((value) => ({ value, label: value }))
          : [],
      loading: options === 'loading',
      error:
        options === 'error' ? { retry: () => setOptions('ready') } : undefined,
    }),
  };

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      {
        id: 'status',
        accessorKey: 'status',
        title: 'Status',
        filter: 'status',
      },
    ],
    []
  );

  const store = useMemoryDataTableStore<State>({ status: 'active' });
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    filters,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 text-sm">
        Options:
        {(['loading', 'error', 'ready'] as const).map((next) => (
          <label key={next} className="flex items-center gap-1">
            <input
              type="radio"
              checked={options === next}
              onChange={() => setOptions(next)}
            />
            {next}
          </label>
        ))}
      </div>
      <DataTableToolbar table={table} />
      <DataTable
        table={table}
        columns={columns}
        data={queryUsers(table.state).slice(0, 10)}
        label="Users"
        getRowId={(user) => user.id}
      />
    </div>
  );
};

export const ColumnGroups = () => {
  const { i18n } = useTranslation();
  const columns = useMemo((): ReadonlyArray<DataTableColumn<Order>> => {
    // Amounts in the reader's language: separators, currency, and its place.
    const amount = new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
    });
    return [
      { id: 'customer', accessorKey: 'customer', title: 'Customer' },
      {
        id: 'amount',
        title: 'Amount',
        columns: [
          {
            id: 'net',
            accessorKey: 'net',
            title: 'Excl. VAT',
            align: 'end',
            cell: ({ row }) => amount.format(row.original.net),
          },
          {
            id: 'vat',
            accessorKey: 'vat',
            title: 'VAT',
            align: 'end',
            cell: ({ row }) => amount.format(row.original.vat),
          },
        ],
      },
    ];
  }, [i18n.language]);

  return (
    <DataTable
      columns={columns}
      data={orders}
      label="Orders"
      getRowId={(order) => order.id}
    />
  );
};

export const Virtualized = () => {
  type Column = 'name' | 'status' | 'orders';
  type State = DataTableBaseState<Column>;

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      { id: 'status', accessorKey: 'status', title: 'Status', sortable: true },
      {
        id: 'orders',
        accessorKey: 'orders',
        title: 'Orders',
        sortable: true,
        align: 'end',
      },
    ],
    []
  );
  const [manyUsers] = useState(() => makeUsers(10_000));

  const store = useMemoryDataTableStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });

  // A virtual table needs a parent that bounds its height: it renders only the rows in view.
  return (
    <div className="flex h-120 flex-col">
      <DataTable
        table={table}
        columns={columns}
        data={queryUsers(table.state, manyUsers)}
        label="Users"
        getRowId={(user) => user.id}
        virtual={{ rowHeight: 37 }}
        footer={`${manyUsers.length} users`}
      />
    </div>
  );
};

export const RowClickAndActions = () => {
  const [opened, setOpened] = useState<User | null>(null);

  // The actions column has no `title`: it is not listed in the "Columns" menu and never hides. `shrink` makes it as
  // narrow as its button. Add `sticky: 'end'` to keep it in view while the other columns scroll under it.
  const columns = useMemo(
    (): ReadonlyArray<DataTableColumn<User>> => [
      { id: 'name', accessorKey: 'name', title: 'Name' },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      { id: 'status', accessorKey: 'status', title: 'Status' },
      { id: 'orders', accessorKey: 'orders', title: 'Orders', align: 'end' },
      {
        id: 'tags',
        title: 'Tags',
        cell: ({ row }) => row.original.tags.join(', '),
      },
      {
        id: 'actions',
        // Held at the end of its row while the other columns scroll under it.
        sticky: 'end',
        header: () => <span className="sr-only">Actions</span>,
        // A click on the menu or its items does not open the row: the table leaves its own controls alone.
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpened(row.original)}>
                <PencilLineIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => alert(`Delete ${row.original.name}`)}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={users.slice(0, 8)}
        label="Users"
        getRowId={(user) => user.id}
        onRowClick={setOpened}
      />
      <Dialog
        open={opened !== null}
        onOpenChange={(open) => {
          if (!open) setOpened(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{opened?.name}</DialogTitle>
            <DialogDescription>{opened?.email}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {opened?.status} · {opened?.orders} orders
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const RowSelection = () => {
  type Column = 'name' | 'status' | 'orders';
  type Filters = { readonly status?: User['status'] | undefined };
  type State = DataTableBaseState<Column> & Filters;

  const filters = {
    status: selectFilter({
      title: 'Status',
      options: userStatuses.map((value) => ({ value, label: value })),
    }),
  };

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      {
        id: 'email',
        accessorKey: 'email',
        title: 'Email',
        filter: 'search',
      },
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
    ],
    []
  );

  const store = useMemoryDataTableStore<State>();
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    filters,
  });
  // Ids, so the selection lasts across pages, sorts and filters. Disabled users cannot be selected.
  const [log, setLog] = useState('');
  const rows = queryUsers(table.state);
  // Every row that matches is known here, on every page: the selection keeps only those. An API that answers one page
  // only would pass `resetOn: table.filtersKey` instead, which clears the selection on a new search or filter.
  const selection = useDataTableSelection<User>({
    rowLabel: (user) => `Select ${user.name}`,
    canSelect: (user) => user.status !== 'disabled',
    matching: rows.map((user) => user.id),
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        search={{
          'aria-label': 'Search users',
          placeholder: 'Search by name or email',
        }}
        // While rows are selected, the bar of their actions takes the toolbar's place: the table does not move.
        selection={selection}
        selectionActions={
          <>
            <Button
              variant="secondary"
              size="xs"
              onClick={() =>
                setLog(`Email sent to ${selection.ids.join(', ')}`)
              }
            >
              <MailIcon />
              Send an email
            </Button>
            <Button
              variant="destructive-secondary"
              size="xs"
              onClick={() => {
                setLog(`Deleted ${selection.ids.join(', ')}`);
                selection.clear();
              }}
            >
              <Trash2Icon />
              Delete
            </Button>
          </>
        }
      />
      <DataTable
        table={table}
        columns={columns}
        data={rows}
        label="Users"
        getRowId={(user) => user.id}
        selection={selection}
        empty={
          <DataTableEmptyState
            searchTerm={table.state.q}
            filtered={table.isFiltered}
            onReset={table.reset}
          />
        }
      />
      <output className="text-sm text-muted-foreground">{log}</output>
    </div>
  );
};

export const UrlState = () => {
  // In the app, the schema sits on the route of the page (`validateSearch`); here, the story builds its own router, in
  // memory, so its URL shows under the table.
  const [router] = useState(() => {
    // One list for the URL and the select: the two cannot drift apart.
    const pageSizes = [10, 25, 50];
    const usersSearchSchema = dataTableSearchSchema({
      columns: ['name', 'status', 'orders'],
      pageSizes,
      filters: {
        status: z.enum(userStatuses),
        tags: z.array(z.enum(userTags)),
      },
    });

    const rootRoute = createRootRoute({
      component: UsersPage,
      validateSearch: usersSearchSchema,
    });

    function UsersPage() {
      // The routes of the app are registered, so `Route.useSearch()` is typed; this router of a story is not.
      const search: z.output<typeof usersSearchSchema> = rootRoute.useSearch();
      const table = useRouterDataTable({
        search,
        defaultSorting: { column: 'name', direction: 'asc' },
        filters: {
          status: selectFilter({
            title: 'Status',
            options: userStatuses.map((value) => ({ value, label: value })),
          }),
          tags: multiSelectFilter({
            title: 'Tags',
            options: userTags.map((value) => ({ value, label: value })),
          }),
        },
      });
      const rows = queryUsers(table.state);

      const columns = useMemo(
        (): ReadonlyArray<DataTableColumnFor<User, typeof table.state>> => [
          {
            id: 'name',
            accessorKey: 'name',
            title: 'Name',
            sortable: true,
            filter: 'search',
          },
          {
            id: 'email',
            accessorKey: 'email',
            title: 'Email',
            filter: 'search',
          },
          {
            id: 'status',
            accessorKey: 'status',
            title: 'Status',
            sortable: true,
            filter: 'status',
          },
          {
            id: 'tags',
            title: 'Tags',
            filter: 'tags',
            cell: ({ row }) => row.original.tags.join(', '),
          },
          {
            id: 'orders',
            accessorKey: 'orders',
            title: 'Orders',
            sortable: true,
            align: 'end',
          },
        ],
        []
      );

      return (
        <div className="flex h-svh flex-col gap-4 p-4">
          <AddressBar />
          <DataTableToolbar
            table={table}
            search={{
              'aria-label': 'Search users',
              placeholder: 'Search by name or email',
            }}
          />
          <DataTable
            table={table}
            columns={columns}
            data={rows.slice(
              (table.page - 1) * table.pageSize,
              table.page * table.pageSize
            )}
            label="Users"
            getRowId={(user) => user.id}
            empty={
              <DataTableEmptyState
                searchTerm={table.state.q}
                filtered={table.isFiltered}
                onReset={table.reset}
              />
            }
            footer={
              <DataTablePagination
                table={table}
                total={rows.length}
                pageSizes={pageSizes}
                results={`${rows.length} ${rows.length === 1 ? 'user' : 'users'}`}
                aria-label="Pages of users"
              />
            }
          />
        </div>
      );
    }

    return createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
  });

  return <RouterProvider router={router} />;
};
UrlState.parameters = { layout: 'fullscreen' };

// What the story shows of the router: the address, Back and Forward, and URLs the schema has to correct.
function AddressBar() {
  const router = useRouter();
  const href = useRouterState({ select: (state) => state.location.href });
  const go = (url: string) => void router.navigate({ href: url });
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/50 p-2 text-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.history.back()}
        >
          Back
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.history.forward()}
        >
          Forward
        </Button>
        <output className="min-w-0 truncate font-mono">
          {decodeURIComponent(href)}
        </output>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        Try:
        <Button
          variant="link"
          size="sm"
          onClick={() =>
            go(
              '/?status=%22active%22&orderBy=%22orders%22&dir=%22desc%22&size=25'
            )
          }
        >
          a valid state
        </Button>
        <Button
          variant="link"
          size="sm"
          onClick={() =>
            go('/?page=-3&orderBy=%22colour%22&status=%22nope%22&size=33')
          }
        >
          invalid values
        </Button>
      </div>
    </div>
  );
}

export const RealLifeUseCase = () => {
  // Everything at once, as a page of the app would have it: the state in the URL (validated by Zod), the rows from an
  // API through TanStack Query, filters whose options load, sorting, pages, columns to show or hide, selection with
  // bulk actions, a row that opens a dialog, and the actions of a row. The router is the story's own, in memory.
  const [router] = useState(() => {
    // One list for the URL and the select: the two cannot drift apart.
    const pageSizes = [10, 25, 50];
    const usersSearchSchema = dataTableSearchSchema({
      columns: ['name', 'status', 'orders'],
      pageSizes,
      filters: {
        status: z.enum(userStatuses),
        // Any text: the tags come from the API, so the schema cannot list them.
        tags: z.array(z.string()),
      },
    });

    const rootRoute = createRootRoute({
      component: UsersPage,
      validateSearch: usersSearchSchema,
    });

    const usersQueryOptions = (
      query: Parameters<typeof fetchUsersPage>[0],
      network: FakeNetwork
    ) =>
      queryOptions({
        queryKey: ['stories', 'users', query],
        queryFn: () => fetchUsersPage(query, network),
        // The rows of the last page stay while the next one loads: the table fades instead of blinking.
        placeholderData: keepPreviousData,
        retry: false,
      });

    const tagsQueryOptions = (network: FakeNetwork) =>
      queryOptions({
        queryKey: ['stories', 'tags'],
        queryFn: () => fetchTags(network),
        retry: false,
      });

    function UsersPage() {
      const [network, setNetwork] = useState<FakeNetwork>({
        latency: 400,
        fails: false,
      });
      // The routes of the app are registered, so `Route.useSearch()` is typed; this router of a story is not.
      const search: z.output<typeof usersSearchSchema> = rootRoute.useSearch();

      const tags = useQuery(tagsQueryOptions(network));
      const table = useRouterDataTable({
        search,
        defaultSorting: { column: 'name', direction: 'asc' },
        filters: {
          status: selectFilter({
            title: 'Status',
            options: userStatuses.map((value) => ({ value, label: value })),
          }),
          tags: multiSelectFilter({
            title: 'Tags',
            options: tags.data ?? [],
            loading: tags.isFetching,
            error: tags.isError
              ? { retry: () => void tags.refetch() }
              : undefined,
          }),
        },
      });

      // The query is the state, normalized: `{}` and `{ page: 1 }` ask for the same rows.
      const query = {
        q: (table.state.q ?? '').trim(),
        orderBy: table.sorting.column,
        dir: table.sorting.direction,
        status: table.state.status,
        tags: table.state.tags,
        page: table.page,
        size: table.pageSize,
      };
      const users = useQuery(usersQueryOptions(query, network));

      // The API answers the ids of every user that matches: the selection keeps only those.
      const selection = useDataTableSelection<User>({
        rowLabel: (user) => `Select ${user.name}`,
        canSelect: (user) => user.status !== 'disabled',
        matching: users.isPlaceholderData ? undefined : users.data?.ids,
      });
      const [opened, setOpened] = useState<User | null>(null);

      const ui = getUiState((set) => {
        if (users.data !== undefined)
          return set('default', {
            ...users.data,
            refreshFailed: users.isError,
          });
        if (users.isError) return set('error');
        return set('pending');
      });
      const { items, total } = ui.is('default')
        ? ui.state
        : { items: [], total: 0 };

      const columns = useMemo(
        (): ReadonlyArray<DataTableColumnFor<User, typeof table.state>> => [
          {
            id: 'name',
            accessorKey: 'name',
            title: 'Name',
            // Widths that hold from one page to the next, whatever the rows.
            size: 180,
            sortable: true,
            filter: 'search',
          },
          {
            id: 'email',
            accessorKey: 'email',
            title: 'Email',
            size: 260,
            filter: 'search',
          },
          {
            id: 'status',
            accessorKey: 'status',
            title: 'Status',
            size: 120,
            sortable: true,
            filter: 'status',
            cell: ({ row }) => (
              <Badge
                variant={
                  row.original.status === 'active' ? 'default' : 'secondary'
                }
              >
                {row.original.status}
              </Badge>
            ),
          },
          {
            id: 'tags',
            title: 'Tags',
            size: 160,
            filter: 'tags',
            cell: ({ row }) => (
              <div className="flex gap-1">
                {row.original.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ),
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${row.original.name}`}
                    />
                  }
                >
                  <EllipsisIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpened(row.original)}>
                    <PencilLineIcon />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.success(`Copied ${row.original.email}`)
                    }
                  >
                    <CopyIcon />
                    Copy the email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => toast.error(`Deleted ${row.original.name}`)}
                  >
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ],
        []
      );

      return (
        <div className="flex h-svh flex-col gap-4 p-4">
          <AddressBar />
          <div className="flex gap-4 text-sm">
            <Checkbox
              checked={network.latency > 500}
              onCheckedChange={(slow) =>
                setNetwork({ ...network, latency: slow ? 2000 : 400 })
              }
            >
              Slow network
            </Checkbox>
            <Checkbox
              checked={network.fails}
              onCheckedChange={(fails) => setNetwork({ ...network, fails })}
            >
              Requests fail
            </Checkbox>
          </div>
          <DataTableToolbar
            table={table}
            search={{
              'aria-label': 'Search users',
              placeholder: 'Search by name or email',
            }}
            selection={selection}
            selectionActions={
              <>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() =>
                    toast.success(`Email sent to ${selection.count} users`)
                  }
                >
                  <MailIcon />
                  Send an email
                </Button>
                <Button
                  variant="destructive-secondary"
                  size="xs"
                  onClick={() => {
                    toast.error(`Deleted ${selection.count} users`);
                    selection.clear();
                  }}
                >
                  <Trash2Icon />
                  Delete
                </Button>
              </>
            }
          >
            <Button
              variant="secondary"
              size="sm"
              loading={users.isFetching}
              onClick={() => void users.refetch()}
            >
              <RotateCwIcon />
              Refresh
            </Button>
            <DataTableColumnVisibility table={table} columns={columns} />
          </DataTableToolbar>

          {ui.is('default') && ui.state.refreshFailed && (
            <p role="alert" className="text-sm text-destructive">
              Could not refresh the users: they may be out of date.
            </p>
          )}
          <DataTable
            busy={users.isPlaceholderData}
            table={table}
            columns={columns}
            data={items}
            label="Users"
            getRowId={(user) => user.id}
            selection={selection}
            onRowClick={setOpened}
            empty={ui
              .match('pending', () => <DataTableLoadingState />)
              .match('error', () => (
                <DataTableErrorState
                  failure={users.errorUpdatedAt}
                  title="Could not load the users"
                  retry={() => void users.refetch()}
                  retrying={users.isFetching}
                />
              ))
              .match('default', () => (
                <DataTableEmptyState
                  searchTerm={table.state.q}
                  filtered={table.isFiltered}
                  onReset={table.reset}
                />
              ))
              .exhaustive()}
            footer={
              ui.is('default') ? (
                <DataTablePagination
                  table={table}
                  total={total}
                  busy={users.isPlaceholderData}
                  pageSizes={pageSizes}
                  results={`${total} ${total === 1 ? 'user' : 'users'}`}
                  aria-label="Pages of users"
                />
              ) : undefined
            }
          />
          <Dialog
            open={opened !== null}
            onOpenChange={(open) => {
              if (!open) setOpened(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{opened?.name}</DialogTitle>
                <DialogDescription>{opened?.email}</DialogDescription>
              </DialogHeader>
              <DialogBody>
                {opened?.status} · {opened?.orders} orders ·{' '}
                {opened?.tags.join(', ') || 'no tag'}
              </DialogBody>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
  });

  return <RouterProvider router={router} />;
};
RealLifeUseCase.parameters = { layout: 'fullscreen' };

/** The value of the Orders filter: an operator, and the numbers it compares the orders of a user with. */
type OrdersCondition = {
  readonly op: 'gt' | 'lt' | 'between';
  readonly from?: number | undefined;
  readonly to?: number | undefined;
};

const ordersOperators = [
  { value: 'gt', label: 'More than' },
  { value: 'lt', label: 'Less than' },
  { value: 'between', label: 'Between' },
] as const;

export const CustomFilter = () => {
  type Column = 'name' | 'orders';
  type Filters = {
    readonly status?: User['status'] | undefined;
    readonly orders?: OrdersCondition | undefined;
  };
  type State = DataTableBaseState<Column> & Filters;

  // A filter of your own is a `DataTableFilter`: the title of its chip, what the chip says of a value, and an editor.
  // Its editor gets the chip's button as `trigger`, the value, and `onValueChange`. Here it renders a component, so
  // the editor can keep a draft in state until Apply.
  const ordersFilter: DataTableFilter<OrdersCondition> = {
    title: 'Orders',
    placeholder: 'Any',
    summary: ({ op, from, to }) =>
      op === 'gt' ? `> ${from}` : op === 'lt' ? `< ${from}` : `${from} – ${to}`,
    // Incomplete, the condition filters nothing: the chip shows "Any", and the state leaves it out.
    isEmpty: ({ op, from, to }) =>
      from === undefined || (op === 'between' && to === undefined),
    editor: (props) => <OrdersConditionEditor {...props} />,
  };

  const filters = {
    status: selectFilter({
      title: 'Status',
      options: userStatuses.map((value) => ({ value, label: value })),
    }),
    orders: ordersFilter,
  };

  const columns = useMemo(
    (): ReadonlyArray<DataTableColumnFor<User, State>> => [
      { id: 'name', accessorKey: 'name', title: 'Name', sortable: true },
      { id: 'email', accessorKey: 'email', title: 'Email' },
      {
        id: 'status',
        accessorKey: 'status',
        title: 'Status',
        filter: 'status',
      },
      {
        id: 'orders',
        accessorKey: 'orders',
        title: 'Orders',
        sortable: true,
        filter: 'orders',
        align: 'end',
      },
    ],
    []
  );

  const store = useMemoryDataTableStore<State>({
    orders: { op: 'between', from: 20, to: 60 },
  });
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    filters,
  });

  // The API knows the search, the sorting and the status; the condition on orders is applied here, as an API would.
  const { orders } = table.state;
  const rows = queryUsers(table.state).filter((user) =>
    orders === undefined || orders.from === undefined
      ? true
      : orders.op === 'gt'
        ? user.orders > orders.from
        : orders.op === 'lt'
          ? user.orders < orders.from
          : user.orders >= orders.from && user.orders <= (orders.to ?? Infinity)
  );

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        search={{ 'aria-label': 'Search users', placeholder: 'Search users' }}
      />
      <DataTable
        table={table}
        columns={columns}
        data={rows}
        label="Users"
        getRowId={(user) => user.id}
        empty={
          <DataTableEmptyState
            searchTerm={table.state.q}
            filtered={table.isFiltered}
            onReset={table.reset}
          />
        }
        footer={`${rows.length} users`}
      />
    </div>
  );
};

// The editor of the Orders filter. A component of its own, outside the story: a component declared inside another
// one would be a new one at each render, and lose its draft.
function OrdersConditionEditor({
  trigger,
  title,
  value,
  onValueChange,
  open,
  onOpenChange,
}: DataTableFilterEditorProps<OrdersCondition>) {
  const [draft, setDraft] = useState<OrdersCondition>(value ?? { op: 'gt' });
  // Each opening starts from the value of the filter, not from a draft left behind: the chip, "Add filter" and the
  // header of the column all open it.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value ?? { op: 'gt' });
  }
  const valid =
    draft.from !== undefined &&
    (draft.op !== 'between' ||
      (draft.to !== undefined && draft.to >= draft.from));

  return (
    <DataTableFilterPopover
      trigger={trigger}
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      className="w-64"
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          onValueChange(draft);
          onOpenChange(false);
        }}
      >
        <Select
          items={ordersOperators}
          value={draft.op}
          onValueChange={(op) => {
            if (op !== null) setDraft({ ...draft, op });
          }}
        >
          <SelectTrigger size="sm" aria-label="Operator">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ordersOperators.map((operator) => (
              <SelectItem key={operator.value} value={operator.value}>
                {operator.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <NumberInput
            size="sm"
            min={0}
            value={draft.from ?? null}
            onValueChange={(from) =>
              setDraft({ ...draft, from: from ?? undefined })
            }
            inputProps={{
              'aria-label': draft.op === 'between' ? 'From' : 'Orders',
            }}
          />
          {draft.op === 'between' && (
            <>
              <span className="text-muted-foreground">and</span>
              <NumberInput
                size="sm"
                min={0}
                value={draft.to ?? null}
                onValueChange={(to) =>
                  setDraft({ ...draft, to: to ?? undefined })
                }
                inputProps={{ 'aria-label': 'To' }}
              />
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onValueChange(undefined);
              onOpenChange(false);
            }}
          >
            Clear
          </Button>
          <Button type="submit" size="sm" disabled={!valid}>
            Apply
          </Button>
        </div>
      </form>
    </DataTableFilterPopover>
  );
}
