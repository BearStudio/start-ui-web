import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { z } from 'zod';

import {
  type DataTableSearch,
  dataTableSearchSchema,
} from '@/components/data-table/search-schema';
import { useRouterDataTable } from '@/components/data-table/use-router-data-table';
import { multiSelectFilter } from '@/components/ui/data-table/filters/multi-select-filter';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';

import { render } from '@/tests/utils';

const schema = dataTableSearchSchema({
  columns: ['name'],
  filters: { tags: z.array(z.enum(['vip', 'beta'])) },
});

const setup = async (entries: Array<string>) => {
  const root = createRootRoute();
  const people = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: schema,
    component: function People() {
      const search: DataTableSearch<typeof schema> = people.useSearch();
      const table = useRouterDataTable({
        search,
        defaultSorting: { column: 'name', direction: 'asc' },
        filters: {
          tags: multiSelectFilter({
            title: 'Tags',
            options: [
              { value: 'vip', label: 'VIP' },
              { value: 'beta', label: 'Beta' },
            ],
          }),
        },
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
    },
  });
  const history = createMemoryHistory({
    initialEntries: entries,
    initialIndex: entries.length - 1,
  });
  const router = createRouter({
    routeTree: root.addChildren([people]),
    history,
  });
  await render(<RouterProvider router={router} />);
  return { history };
};

const state = () => page.getByRole('status', { name: 'State' });
const pageLink = (n: number) =>
  page
    .getByRole('navigation', { name: 'Pages' })
    .getByRole('link', { name: `Page ${n}`, exact: true });

describe('useRouterDataTable', () => {
  it('pages with links to the state of each page, and Back and Forward bring the state back', async () => {
    const { history } = await setup(['/']);
    await expect.element(state()).toHaveTextContent('{}');
    await expect.element(pageLink(2)).toHaveAttribute('href', '/?page=2');
    await expect.element(pageLink(1)).toHaveAttribute('href', '/');

    await pageLink(2).click();
    await expect.element(state()).toHaveTextContent('{"page":2}');
    await pageLink(3).click();
    await expect.element(state()).toHaveTextContent('{"page":3}');

    history.back();
    await expect.element(state()).toHaveTextContent('{"page":2}');
    history.back();
    await expect.element(state()).toHaveTextContent('{}');
    history.forward();
    await expect.element(state()).toHaveTextContent('{"page":2}');
  });

  it('leaves a click with a modifier to the browser', async () => {
    await setup(['/']);
    await expect.element(pageLink(2)).toBeVisible();
    let prevented: boolean | undefined;
    // After the app's handler, and before the browser opens a tab.
    document.addEventListener(
      'click',
      (event) => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true }
    );

    pageLink(2)
      .element()
      .dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          metaKey: true,
        })
      );

    expect(prevented).toBe(false);
    await expect.element(state()).toHaveTextContent('{}');
  });

  it('goes from a page past the last to the last in place: Back skips the page that was not there', async () => {
    const { history } = await setup(['/', '/?page=9']);

    await expect.element(state()).toHaveTextContent('{"page":3}');
    expect(history.length).toBe(2);

    history.back();
    await expect.element(state()).toHaveTextContent('{}');
  });

  it('makes one history entry of ticks in a row in one filter', async () => {
    const { history } = await setup(['/']);
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('menuitem', { name: 'Tags' }).click();

    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Beta' }).click();

    await expect.element(state()).toHaveTextContent('{"tags":["vip","beta"]}');
    expect(history.length).toBe(2);
    history.back();
    await expect.element(state()).toHaveTextContent('{}');
  });

  it('keeps a search typed then cleared in the history: Back brings it back', async () => {
    const { history } = await setup(['/']);
    const search = page.getByRole('textbox', { name: 'Search' });

    await search.fill('abc');
    await expect.element(state()).toHaveTextContent('{"q":"abc"}');
    await search.fill('');
    await expect.element(state()).toHaveTextContent('{}');

    history.back();
    await expect.element(state()).toHaveTextContent('{"q":"abc"}');
    await expect.element(search).toHaveValue('abc');
  });

  it('opens a URL with a blank search where it is, without navigating', async () => {
    const { history } = await setup(['/?q=%20&page=3']);

    await expect.element(state()).toHaveTextContent('{"page":3}');
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveValue('');
    // No entry of its own: the router writes the URL it validated in place, as it does for any route.
    expect(history.length).toBe(1);
    expect(history.location.search).toBe('?page=3');
  });
});
