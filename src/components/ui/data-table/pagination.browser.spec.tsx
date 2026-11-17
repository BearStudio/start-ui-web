import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

import { render } from '@/tests/utils';

type State = {
  readonly page?: number | undefined;
  readonly orderBy?: 'name' | undefined;
};

function Pages({
  initial = {},
  width = 'narrow',
  busy: initiallyBusy = false,
  ...count
}: {
  initial?: State;
  width?: 'tiny' | 'narrow' | 'wide';
  busy?: boolean;
  results?: string;
} & ({ pages: number } | { total: number })) {
  const store = useMemoryDataTableStore<State>(initial);
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
  });
  const [busy, setBusy] = useState(initiallyBusy);
  return (
    <>
      <button type="button" onClick={() => setBusy(false)}>
        Loaded
      </button>
      {/* The footer of a table is the container its pages are laid out in. */}
      <div
        data-testid="footer"
        className={`@container ${{ tiny: 'w-64', narrow: 'w-80', wide: 'w-200' }[width]}`}
      >
        <DataTablePagination
          table={table}
          busy={busy}
          aria-label="Pages"
          {...count}
        />
      </div>
    </>
  );
}

/** The page buttons shown, by number. */
const shownPages = () =>
  page
    .getByRole('button', { name: /^Page \d+$/ })
    .elements()
    .map((element) => element.textContent);

describe('DataTablePagination', () => {
  it('counts the pages from the total and the page size, and never fewer than one', async () => {
    const screen = await render(<Pages total={45} />);
    await expect.element(page.getByText('Page 1 of 5')).toBeVisible();

    await screen.rerender(<Pages total={0} />);
    await expect.element(page.getByText('Page 1 of 1')).toBeVisible();

    await screen.rerender(<Pages pages={0} />);
    await expect.element(page.getByText('Page 1 of 1')).toBeVisible();

    await screen.rerender(<Pages total={Number.NaN} />);
    await expect.element(page.getByText('Page 1 of 1')).toBeVisible();

    await screen.rerender(<Pages pages={Number.NaN} />);
    await expect.element(page.getByText('Page 1 of 1')).toBeVisible();
  });

  it('stays on a page past the last while busy, and goes to the last once loaded', async () => {
    await render(<Pages initial={{ page: 5 }} pages={2} busy />);
    await expect.element(page.getByText('Page 5 of 2')).toBeVisible();

    await page.getByRole('button', { name: 'Loaded' }).click();

    await expect.element(page.getByText('Page 2 of 2')).toBeVisible();
  });

  it('shows the current page alone, between Previous and Next, in the narrowest footer', async () => {
    await render(<Pages initial={{ page: 10 }} pages={20} width="tiny" />);
    await expect.element(page.getByText('Page 10 of 20')).toBeVisible();

    expect(shownPages()).toEqual(['10']);
    await expect
      .element(page.getByRole('button', { name: 'Page 10' }))
      .toHaveAttribute('aria-current', 'page');
    const footer = page.getByTestId('footer').element().getBoundingClientRect();
    for (const name of ['Previous', 'Next']) {
      const box = page
        .getByRole('button', { name })
        .element()
        .getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(footer.left);
      expect(box.right).toBeLessThanOrEqual(footer.right);
    }
  });

  it('shows the first, current and last pages in a narrow footer, and nothing overflows it', async () => {
    await render(<Pages initial={{ page: 10 }} pages={20} />);
    await expect.element(page.getByText('Page 10 of 20')).toBeVisible();

    expect(shownPages()).toEqual(['1', '10', '20']);
    const footer = page.getByTestId('footer').element();
    expect(footer.getBoundingClientRect().width).toBe(320);
    expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
    const nav = page.getByRole('navigation', { name: 'Pages' }).element();
    expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
  });

  it('shows the pages around the current one in a wide footer', async () => {
    await render(<Pages initial={{ page: 10 }} pages={20} width="wide" />);
    await expect.element(page.getByText('Page 10 of 20')).toBeVisible();

    expect(shownPages()).toEqual(['1', '9', '10', '11', '20']);
  });

  it('fits a page of five digits in its button', async () => {
    await render(
      <Pages initial={{ page: 12_345 }} pages={99_999} width="wide" />
    );

    const current = page.getByRole('button', { name: 'Page 12345' });
    await expect.element(current).toHaveAttribute('aria-current', 'page');
    const element = current.element();
    expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth);
  });

  it('gives the focus to the current page shown once Next reaches the last', async () => {
    await render(<Pages initial={{ page: 19 }} pages={20} />);

    await page.getByRole('button', { name: 'Next' }).click();

    const last = page.getByRole('button', { name: 'Page 20' });
    await expect.element(last).toHaveAttribute('aria-current', 'page');
    await expect.element(last).toHaveFocus();
    await expect
      .element(page.getByRole('button', { name: 'Next' }))
      .toBeDisabled();
  });

  it('shows the page with how many rows match, once', async () => {
    await render(<Pages initial={{ page: 2 }} pages={3} results="37 users" />);

    const text = page.getByText('Page 2 of 3, 37 users');
    await expect.element(text).toBeVisible();
    expect(text.element().closest('[aria-hidden]')).toBeNull();
    expect(page.getByText(/Page 2 of 3/).elements()).toHaveLength(1);
  });

  it('keeps the page size named, though its label hides, in two lines at most of a narrow footer', async () => {
    function Sized() {
      const store = useMemoryDataTableStore<State>({ page: 4 });
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
      });
      return (
        <div
          data-testid="footer"
          style={{ '--width': '262px' } as React.CSSProperties}
          className="@container w-(--width)"
        >
          <DataTablePagination
            table={table}
            pages={20}
            pageSizes={[10, 25, 50]}
            aria-label="Pages"
          />
        </div>
      );
    }
    await render(<Sized />);

    const select = page.getByRole('combobox', { name: 'Rows per page' });
    await expect.element(select).toBeVisible();
    expect(page.getByText('Rows per page').element().className).toContain(
      'sr-only'
    );
    expect(
      getComputedStyle(page.getByText('Rows per page').element()).position
    ).toBe('absolute');
    const footer = page.getByTestId('footer').element();
    // A line: the boxes that overlap one another vertically.
    const boxes = [...footer.querySelectorAll('button, [role=combobox], p')]
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.width > 0)
      .sort((a, b) => a.top - b.top);
    let lines = 0;
    let bottom = -Infinity;
    for (const box of boxes) {
      if (box.top >= bottom) lines++;
      bottom = Math.max(bottom, box.bottom);
    }
    expect(lines).toBeLessThanOrEqual(2);
    // On a line of its own, the page list sits at the end.
    const nav = page.getByRole('navigation', { name: 'Pages' }).element();
    expect(
      Math.abs(
        nav.getBoundingClientRect().right - footer.getBoundingClientRect().right
      )
    ).toBeLessThan(1);
    expect(nav.getBoundingClientRect().left).toBeGreaterThan(
      footer.getBoundingClientRect().left + 1
    );
    expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
  });
});
