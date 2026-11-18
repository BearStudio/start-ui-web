import i18next from 'i18next';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  DataTableEmptyState,
  DataTableErrorState,
  DataTableLoadingState,
  DataTableLoadMore,
} from '@/components/ui/data-table/states';

import { render } from '@/tests/utils';

describe('DataTableLoadingState', () => {
  it('says it is loading, for the live region of its table, and hides its skeleton lines from assistive tech', async () => {
    await render(<DataTableLoadingState rows={2} />);

    await expect.element(page.getByText('Loading…')).toBeInTheDocument();
    // Its table's live region says it: one of its own, mounted with its text, is often not read.
    expect(page.getByRole('status').elements()).toHaveLength(0);
    expect(document.querySelectorAll('[aria-hidden=true]')).toHaveLength(2);
  });
});

describe('DataTableLoadingState, many rows', () => {
  it('fades its lines no further than half', async () => {
    await render(<DataTableLoadingState rows={10} />);
    await expect.element(page.getByText('Loading…')).toBeInTheDocument();

    const opacities = [
      ...document.querySelectorAll<HTMLElement>('[aria-hidden=true]'),
    ].map((line) => Number(getComputedStyle(line).opacity));
    expect(opacities).toHaveLength(10);
    expect(Math.min(...opacities)).toBeGreaterThanOrEqual(0.5);
    expect(opacities[0]).toBe(1);
  });
});

describe('DataTableEmptyState', () => {
  it('says there is no data, or what the app says instead', async () => {
    const screen = await render(<DataTableEmptyState />);
    await expect.element(page.getByText('No Data')).toBeVisible();

    await screen.rerender(
      <DataTableEmptyState>No user yet</DataTableEmptyState>
    );
    await expect.element(page.getByText('No user yet')).toBeVisible();
    expect(page.getByRole('button').elements()).toHaveLength(0);
  });

  it('says nothing matches a search or a filter, and offers to clear them', async () => {
    const onReset = vi.fn();
    const screen = await render(
      <DataTableEmptyState searchTerm="ada" onReset={onReset} />
    );
    await expect.element(page.getByText('No results for “ada”')).toBeVisible();

    await page.getByRole('button', { name: 'Clear filters' }).click();
    expect(onReset).toHaveBeenCalledOnce();

    await screen.rerender(<DataTableEmptyState filtered onReset={onReset} />);
    await expect
      .element(page.getByText('No results', { exact: true }))
      .toBeVisible();
  });
});

describe('DataTableErrorState', () => {
  it('alerts, retries, and keeps the focus on the retry while it runs', async () => {
    const retry = vi.fn();
    const screen = await render(<DataTableErrorState retry={retry} />);
    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('Something went wrong');

    const button = page.getByRole('button', { name: 'Retry' });
    await button.click();
    expect(retry).toHaveBeenCalledOnce();
    await expect.element(button).toHaveFocus();

    await screen.rerender(<DataTableErrorState retry={retry} retrying />);
    await expect.element(button).toHaveAttribute('aria-disabled', 'true');
    await expect.element(button).toHaveFocus();
  });
});

describe('DataTableErrorState, failing again', () => {
  it('reads the alert again, and leaves the focus on Retry', async () => {
    const retry = vi.fn();
    const screen = await render(
      <DataTableErrorState retry={retry} failure={1} />
    );
    const button = page.getByRole('button', { name: 'Retry' });
    await button.click();
    await expect.element(button).toHaveFocus();
    const alert = page.getByRole('alert').element();
    const node = button.element();

    await screen.rerender(<DataTableErrorState retry={retry} failure={2} />);

    await expect.element(button).toHaveFocus();
    expect(button.element()).toBe(node);
    expect(page.getByRole('alert').element()).not.toBe(alert);
    // The button is not part of what the alert reads.
    expect(alert.contains(node)).toBe(false);
  });
});

describe('DataTableLoadMore', () => {
  const loadMore = (props: {
    loaded: number;
    hasMore: boolean;
    loading?: boolean;
  }) => <DataTableLoadMore total={30} onLoadMore={() => {}} {...props} />;

  it('says how many rows are loaded, and keeps the focus while the next batch loads', async () => {
    const onLoadMore = vi.fn();
    const screen = await render(
      <DataTableLoadMore
        loaded={10}
        total={30}
        hasMore
        onLoadMore={onLoadMore}
      />
    );
    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('10 of 30');

    const button = page.getByRole('button', { name: 'Load more' });
    await button.click();
    expect(onLoadMore).toHaveBeenCalledOnce();

    await screen.rerender(
      loadMore({ loaded: 10, hasMore: true, loading: true })
    );
    await expect.element(button).toHaveAttribute('aria-disabled', 'true');
    await expect.element(button).toHaveFocus();
  });

  it('gives the focus to the count once the last batch takes the button away', async () => {
    const screen = await render(loadMore({ loaded: 20, hasMore: true }));
    await page.getByRole('button', { name: 'Load more' }).click();

    await screen.rerender(loadMore({ loaded: 30, hasMore: false }));

    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('30 of 30');
    await expect.element(page.getByRole('status')).toHaveFocus();
  });

  it('says how many rows are loaded when the total is unknown', async () => {
    await render(
      <DataTableLoadMore loaded={20} hasMore onLoadMore={() => {}} />
    );

    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('20 loaded');
  });
});

describe('DataTableEmptyState in French', () => {
  it('quotes the search with French quotation marks', async () => {
    await i18next.changeLanguage('fr');
    onTestFinished(async () => {
      await i18next.changeLanguage('en');
    });
    await render(<DataTableEmptyState searchTerm="ada" />);

    const message = document.querySelector(
      '[data-slot=data-table-state-message]'
    );
    // Narrow no-break spaces inside the quotation marks, as French sets them.
    await expect
      .poll(() => message?.textContent)
      .toBe('Aucun résultat pour «\u202fada\u202f»');
  });
});

describe('DataTableLoadMore count', () => {
  it('shows a ring when the focus reaches it from the keyboard', async () => {
    const screen = await render(
      <DataTableLoadMore loaded={20} total={30} hasMore onLoadMore={() => {}} />
    );
    const status = page.getByRole('status');
    await expect.element(status).toHaveTextContent('20 of 30');
    const ring = () => getComputedStyle(status.element()).boxShadow;
    expect(ring()).toBe('none');

    await userEvent.tab();
    await expect
      .element(page.getByRole('button', { name: 'Load more' }))
      .toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await screen.rerender(
      <DataTableLoadMore
        loaded={30}
        total={30}
        hasMore={false}
        onLoadMore={() => {}}
      />
    );

    await expect.element(status).toHaveFocus();
    await expect.poll(ring).not.toBe('none');
  });
});

describe('French counts', () => {
  it.each([
    'components:dataTable.selectedCount',
    'components:dataTable.options.announceCount',
    'components:dataTable.states.loaded',
  ] as const)('says a million in French for %s', (key) => {
    const text = i18next.t(key, { lng: 'fr', count: 1_000_000 });

    expect(text).toMatch(/^1000000 /);
    expect(text).toBe(
      i18next.t(key, { lng: 'fr', count: 2 })?.replace('2', '1000000')
    );
  });
});
