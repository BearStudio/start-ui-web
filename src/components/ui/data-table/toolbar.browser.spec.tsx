import { DirectionProvider } from '@base-ui/react/direction-provider';
import i18next from 'i18next';
import { useState } from 'react';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  type DataTableFilter,
  DataTableFilterChip,
  DataTableFilterPopover,
} from '@/components/ui/data-table/filters/filter';
import { multiSelectFilter } from '@/components/ui/data-table/filters/multi-select-filter';
import type { DataTableOptionsStatus } from '@/components/ui/data-table/filters/options';
import { selectFilter } from '@/components/ui/data-table/filters/select-filter';
import { useMemoryDataTableStore } from '@/components/ui/data-table/memory-store';
import type { DataTableStore } from '@/components/ui/data-table/state';
import { DataTableToolbar } from '@/components/ui/data-table/toolbar';
import { useDataTable } from '@/components/ui/data-table/use-data-table';

import { render } from '@/tests/utils';

type Range = { readonly min?: number | undefined };

type State = {
  readonly page?: number | undefined;
  readonly q?: string | undefined;
  readonly orderBy?: 'name' | undefined;
  readonly dir?: 'asc' | 'desc' | undefined;
  readonly status?: 'active' | 'invited' | undefined;
  readonly tags?: ReadonlyArray<'vip' | 'beta'> | undefined;
  readonly amount?: Range | undefined;
};

// A filter the toolbar knows nothing of: a minimum, typed in a form.
const minimumFilter: DataTableFilter<Range> = {
  title: 'Amount',
  summary: (value) => `≥ ${value.min}`,
  editor: ({ trigger, title, value, onValueChange, open, onOpenChange }) => (
    <DataTableFilterPopover
      trigger={trigger}
      title={title}
      open={open}
      onOpenChange={onOpenChange}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const text = new FormData(event.currentTarget).get('min');
          onValueChange({ min: text === '' ? undefined : Number(text) });
          onOpenChange(false);
        }}
      >
        <input
          name="min"
          aria-label="Minimum"
          type="number"
          defaultValue={value?.min}
        />
        <button type="submit">Apply</button>
      </form>
    </DataTableFilterPopover>
  ),
};

const setup = async (
  initial: State = {},
  status: DataTableOptionsStatus = {},
  // A router applies a change a render later than the toolbar's own state; `'held'` holds the changes until "Land the
  // changes" is clicked, as a slow router would.
  {
    later = false,
    searchable = true,
  }: { later?: boolean | 'held'; searchable?: boolean } = {}
) => {
  const states: Array<State> = [];
  const held: Array<(state: State) => State> = [];
  function Table() {
    const [state, setState] = useState<State>(initial);
    const apply = (next: (state: State) => State) =>
      setState((current) => {
        const result = next(current);
        states.push(result);
        return result;
      });
    const store: DataTableStore<State> = {
      state,
      update: (next) => {
        if (later === 'held') held.push(next);
        else if (later) setTimeout(() => apply(next));
        else apply(next);
      },
    };
    const table = useDataTable({
      store,
      defaultSorting: { column: 'name', direction: 'asc' },
      filters: {
        status: selectFilter({
          title: 'Status',
          options: [
            { value: 'active', label: 'Active', count: 12 },
            { value: 'invited', label: 'Invited', count: 3 },
          ],
          ...status,
        }),
        tags: multiSelectFilter({
          title: 'Tags',
          options: [
            { value: 'vip', label: 'VIP' },
            { value: 'beta', label: 'Beta' },
          ],
        }),
        amount: minimumFilter,
      },
    });
    return (
      <>
        <DataTableToolbar
          table={table}
          {...(searchable && { search: { 'aria-label': 'Search' } })}
        >
          <button type="button">Export</button>
        </DataTableToolbar>
        <button type="button" onClick={() => table.openFilter('tags')}>
          Filter the tags
        </button>
        <button type="button" onClick={() => table.openFilter('search')}>
          Search instead
        </button>
        <button type="button" onClick={() => setState({})}>
          Go back
        </button>
        <button type="button" onClick={() => setState(initial)}>
          Go forward
        </button>
        <button
          type="button"
          onClick={() => held.splice(0).forEach((next) => apply(next))}
        >
          Land the changes
        </button>
      </>
    );
  }
  const screen = await render(<Table />);
  return {
    states,
    last: () => states.at(-1),
    unmount: () => screen.unmount(),
  };
};

/** Clicks a button of the page from a script: a modal menu leaves no pointer through, and keeps the focus. */
const clickBehindMenu = (name: string) =>
  (
    page
      .getByRole('button', { name, exact: true, includeHidden: true })
      .element() as HTMLElement
  ).click();

const chip = (title: string) =>
  page.getByRole('group', { name: `${title} filter` });
/** What the chip shows: its button, without what its live region says. */
const chipText = (title: string) => chip(title).getByRole('button').first();
const addFilter = async (title: string) => {
  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByRole('menuitem', { name: title }).click();
};

// A chip alone, its options in the state `status`, its menu open or not.
const chipOf = (
  status: DataTableOptionsStatus,
  { value, open = true }: { value?: string; open?: boolean } = {}
) => (
  <DataTableFilterChip
    filter={selectFilter({ title: 'Owner', options: [], ...status })}
    value={value}
    onValueChange={() => {}}
    open={open}
    onOpenChange={() => {}}
    onRemove={() => {}}
  />
);
/** What the chip of the Owner says aloud. */
const announced = () => chip('Owner').getByRole('status');

describe('DataTableToolbar', () => {
  it("shows the filters that hold a value, offers the others, and the app's own actions", async () => {
    await setup({ status: 'invited' });

    await expect
      .element(chipText('Status'))
      .toHaveTextContent('Status:Invited');
    await expect
      .element(page.getByRole('button', { name: 'Export' }))
      .toBeVisible();
    await page.getByRole('button', { name: 'Add filter' }).click();
    expect(
      page
        .getByRole('menuitem')
        .elements()
        .map((item) => item.textContent)
    ).toEqual(['Tags', 'Amount']);
  });

  it('opens a filter once added, keeps it with no value, and counts its options', async () => {
    const { last } = await setup();

    await addFilter('Status');
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Active 12' }))
      .toBeVisible();
    await page.getByRole('menuitemradio', { name: 'Active 12' }).click();

    await expect.element(chipText('Status')).toHaveTextContent('Status:Active');
    expect(last()).toEqual({ status: 'active' });
  });

  it('removes a filter: its value goes, and the focus moves to the search', async () => {
    const { last } = await setup({ status: 'active' });

    await page
      .getByRole('button', { name: 'Remove the Status filter' })
      .click();

    expect(last()).toEqual({});
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveFocus();
    expect(chip('Status').elements()).toHaveLength(0);
  });

  it('keeps a multiple filter shown once emptied from its menu', async () => {
    await setup();

    await page.getByRole('button', { name: 'Filter the tags' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();
    await expect.element(chipText('Tags')).toHaveTextContent('Tags:VIP');
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();

    await expect.element(chipText('Tags')).toHaveTextContent('Tags:Select');
  });

  it('keeps a filter emptied from its editor shown, when the store applies the change later', async () => {
    const { last } = await setup({ tags: ['vip'] }, {}, { later: true });

    await chip('Tags').getByRole('button').first().click();
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();

    await expect.element(chipText('Tags')).toHaveTextContent('Tags:Select');
    await expect.poll(last).toEqual({});
    await expect.element(chipText('Tags')).toHaveTextContent('Tags:Select');
  });

  it('hides a filter opened while it held a value, once its value goes from outside', async () => {
    await setup({ tags: ['vip'] });

    await page.getByRole('button', { name: 'Filter the tags' }).click();
    await userEvent.keyboard('{Escape}');
    await page.getByRole('button', { name: 'Go back', exact: true }).click();

    await expect.poll(() => chip('Tags').elements()).toHaveLength(0);
  });

  it.each([
    { store: 'at once', later: false },
    { store: 'a render later', later: true },
  ])(
    'hides a chip when its value goes from outside, with a store that applies changes $store',
    async ({ later }) => {
      await setup({ status: 'active' }, {}, { later });
      await expect.element(chip('Status')).toBeVisible();

      await page.getByRole('button', { name: 'Go back', exact: true }).click();

      await expect.poll(() => chip('Status').elements()).toHaveLength(0);
    }
  );

  it('keeps an option ticked again before its clearing was applied', async () => {
    const { last } = await setup({ tags: ['vip'] }, {}, { later: true });

    await chip('Tags').getByRole('button').first().click();
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();

    await expect.element(chipText('Tags')).toHaveTextContent('Tags:VIP');
    await expect.poll(last).toEqual({ tags: ['vip'] });
    await expect.element(chipText('Tags')).toHaveTextContent('Tags:VIP');
  });

  it('hides a chip on Back once a value followed its emptying before the emptying landed', async () => {
    const { last } = await setup({ tags: ['vip'] }, {}, { later: 'held' });

    await chip('Tags').getByRole('button').first().click();
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Beta' }).click();
    await userEvent.keyboard('{Escape}');
    await page.getByRole('button', { name: 'Land the changes' }).click();
    await expect.poll(last).toEqual({ tags: ['beta'] });
    await expect.element(chipText('Tags')).toHaveTextContent('Tags:Beta');

    await page.getByRole('button', { name: 'Go back', exact: true }).click();

    await expect.poll(() => chip('Tags').elements()).toHaveLength(0);
  });

  it('counts every quick tick, with a store that has not applied the first yet', async () => {
    const { last } = await setup({}, {}, { later: 'held' });

    await page.getByRole('button', { name: 'Filter the tags' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Beta' }).click();
    await userEvent.keyboard('{Escape}');
    await page.getByRole('button', { name: 'Land the changes' }).click();

    await expect.poll(last).toEqual({ tags: ['vip', 'beta'] });
    await expect.element(chipText('Tags')).toHaveTextContent('Tags:VIP, Beta');
  });

  it('resets a search still on its way: nothing is left of it', async () => {
    const { last } = await setup({ status: 'active' });
    // The search waits before it runs: the clock skips the wait.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    onTestFinished(() => {
      vi.useRealTimers();
    });

    await page.getByRole('textbox', { name: 'Search' }).fill('foo');
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await vi.advanceTimersByTimeAsync(1000);
    expect(last()).toEqual({});
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveValue('');
  });

  it('names a value still loading, and says aloud when its options are on their way, once open', async () => {
    const screen = await render(
      chipOf({ loading: true }, { value: 'ada', open: false })
    );

    await expect
      .element(chipText('Owner'))
      .toHaveTextContent('Owner:ada (loading)');
    // Closed, it has nothing to say.
    await expect.element(announced()).toHaveTextContent('');

    await screen.rerender(chipOf({ loading: true }, { value: 'ada' }));
    await expect.element(announced()).toHaveTextContent('Loading the options');
  });

  it('still says how many options it has while they refetch in the background', async () => {
    await setup({ status: 'active' }, { loading: true });

    await chip('Status').getByRole('button').first().click();
    await expect
      .element(chip('Status').getByRole('status'))
      .toHaveTextContent('2 options');
  });

  it('shows a value the options do not hold once, though the URL repeats it', async () => {
    await setup({ tags: ['gone', 'gone'] as unknown as ['vip'] });

    await expect
      .element(chipText('Tags'))
      .toHaveTextContent('Tags:gone (not an option)');
    await chip('Tags').getByRole('button').first().click();
    expect(
      page
        .getByRole('menuitemcheckbox', { name: 'gone (not an option)' })
        .elements()
    ).toHaveLength(1);
  });

  it('shows a value the options do not hold, and keeps it when another is ticked', async () => {
    const { last } = await setup({ tags: ['gone' as 'vip'] });

    await expect
      .element(chipText('Tags'))
      .toHaveTextContent('Tags:gone (not an option)');
    await chip('Tags').getByRole('button').first().click();
    await page.getByRole('menuitemcheckbox', { name: 'Beta' }).click();

    expect(last()).toEqual({ tags: ['beta', 'gone'] });
  });

  it('says when its options are on their way, and when they could not be loaded', async () => {
    const retry = vi.fn();
    await setup({ status: 'active' }, { loading: true });
    await chip('Status').getByRole('button').first().click();
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Active 12' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');

    await setup({ status: 'invited' }, { error: { retry } });
    await page
      .getByRole('group', { name: 'Status filter' })
      .last()
      .getByRole('button')
      .first()
      .click();
    await expect
      .element(page.getByRole('status').filter({ hasText: 'options' }).last())
      .toHaveTextContent('Could not load the options');
    await userEvent.keyboard('{Escape}');
    await page
      .getByRole('group', { name: 'Status filter' })
      .last()
      .getByRole('button')
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Retry' }).click();

    expect(retry).toHaveBeenCalledOnce();
  });

  it('edits a filter of its own kind, which the toolbar frames like any other', async () => {
    const { last } = await setup();

    await addFilter('Amount');
    await page.getByRole('spinbutton', { name: 'Minimum' }).fill('10');
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect.element(chipText('Amount')).toHaveTextContent('Amount:≥ 10');
    expect(last()).toEqual({ amount: { min: 10 } });
  });

  it('resets the search and every filter, and is gone once nothing narrows the rows', async () => {
    const { last } = await setup({ q: 'ada', status: 'active', tags: ['vip'] });

    await page.getByRole('button', { name: 'Clear filters' }).click();

    expect(last()).toEqual({});
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveValue('');
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveFocus();
    expect(chip('Status').elements()).toHaveLength(0);
    expect(
      page.getByRole('button', { name: 'Clear filters' }).elements()
    ).toHaveLength(0);
  });

  it.each([
    { store: 'at once', later: false },
    { store: 'a render later', later: true },
  ])(
    'gives the focus to Add filter once it comes back, every filter shown, with a store that applies changes $store',
    async ({ later }) => {
      const all = {
        status: 'active',
        tags: ['vip'],
        amount: { min: 1 },
      } as const;
      const screen = await setup(all, {}, { searchable: false, later });
      expect(
        page.getByRole('button', { name: 'Add filter' }).elements()
      ).toHaveLength(0);

      await page
        .getByRole('button', { name: 'Remove the Status filter' })
        .click();
      await expect
        .element(page.getByRole('button', { name: 'Add filter' }))
        .toHaveFocus();
      await screen.unmount();

      await setup(all, {}, { searchable: false, later });
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await expect
        .element(page.getByRole('button', { name: 'Add filter' }))
        .toHaveFocus();
    }
  );

  it('gives the focus to Add filter after a removal or a reset, in a toolbar with no search', async () => {
    await setup({ status: 'active', tags: ['vip'] }, {}, { searchable: false });

    await page
      .getByRole('button', { name: 'Remove the Status filter' })
      .click();
    await expect
      .element(page.getByRole('button', { name: 'Add filter' }))
      .toHaveFocus();

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect
      .element(page.getByRole('button', { name: 'Add filter' }))
      .toHaveFocus();
  });

  it('does not bring a filter back open, once it went while its menu was open', async () => {
    await setup({ tags: ['vip'] });

    await page.getByRole('button', { name: 'Filter the tags' }).click();
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'VIP' }))
      .toBeVisible();
    // Back, while the menu is open: the menu is modal, so the click comes from a script.
    clickBehindMenu('Go back');
    await expect.poll(() => chip('Tags').elements()).toHaveLength(0);
    await page.getByRole('button', { name: 'Go forward' }).click();

    await expect.element(chipText('Tags')).toHaveTextContent('Tags:VIP');
    expect(page.getByRole('menu').elements()).toHaveLength(0);
  });

  it('leaves the focus where it is when asked for a search it does not have', async () => {
    await setup({}, {}, { searchable: false });

    await page.getByRole('button', { name: 'Search instead' }).click();

    await expect
      .element(page.getByRole('button', { name: 'Search instead' }))
      .toHaveFocus();
  });

  it('focuses the search on demand, as a column header asks', async () => {
    await setup();

    await page.getByRole('button', { name: 'Search instead' }).click();

    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveFocus();
  });

  it('says aloud when a retry of its options fails again', async () => {
    const retry = vi.fn();
    const screen = await render(chipOf({ error: { retry } }));
    await expect
      .element(announced())
      .toHaveTextContent('Could not load the options');

    await screen.rerender(chipOf({ error: { retry }, loading: true }));
    await expect.element(announced()).toHaveTextContent('Loading the options');
    await screen.rerender(chipOf({ error: { retry } }));

    await expect
      .element(announced())
      .toHaveTextContent('Could not load the options');
  });
});

describe('DataTableToolbar chips, with a store that applies changes later', () => {
  it('keeps a chip emptied one tick at a time, its menu open and its focus, before the store applied any', async () => {
    const { last } = await setup(
      { tags: ['vip', 'beta'] },
      {},
      { later: 'held' }
    );
    await chip('Tags').getByRole('button').first().click();

    await page.getByRole('menuitemcheckbox', { name: 'VIP' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Beta' }).click();
    // The menu is modal, and keeps the focus: the store lands the changes from a script.
    clickBehindMenu('Land the changes');

    await expect.poll(last).toEqual({});
    await expect.element(chipText('Tags')).toHaveTextContent('Tags:Select');
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Beta' }))
      .toHaveFocus();
  });

  it('lets a chip go with its value after a change that changed nothing', async () => {
    await setup({ amount: { min: 1 } });
    await chip('Amount').getByRole('button').first().click();
    await page.getByRole('button', { name: 'Apply' }).click();

    await page.getByRole('button', { name: 'Go back', exact: true }).click();

    await expect.poll(() => chip('Amount').elements()).toHaveLength(0);
  });
});

describe('DataTableToolbar search', () => {
  it('keeps a blank typed in the search, though it searches for nothing', async () => {
    const { states } = await setup();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    onTestFinished(() => {
      vi.useRealTimers();
    });

    await page.getByRole('textbox', { name: 'Search' }).fill(' ');
    await vi.advanceTimersByTimeAsync(1000);

    expect(states).toEqual([]);
    await expect
      .element(page.getByRole('textbox', { name: 'Search' }))
      .toHaveValue(' ');
  });
});

function Layout({ initial }: { initial: State }) {
  const store = useMemoryDataTableStore<State>(initial);
  const table = useDataTable({
    store,
    defaultSorting: { column: 'name', direction: 'asc' },
    filters: {
      status: selectFilter({
        title: 'Status',
        options: [{ value: 'active', label: 'Active' }],
      }),
      tags: multiSelectFilter({
        title: 'Tags',
        options: [
          { value: 'vip', label: 'VIP' },
          { value: 'beta', label: 'Beta' },
        ],
      }),
      amount: minimumFilter,
    },
  });
  return (
    <DataTableToolbar table={table} search={{ 'aria-label': 'Search' }}>
      <button type="button">Export</button>
    </DataTableToolbar>
  );
}

/** Sets the size of the page for this test. */
const viewport = async (width: number) => {
  const [initialWidth, initialHeight] = [innerWidth, innerHeight];
  await page.viewport(width, 800);
  onTestFinished(() => page.viewport(initialWidth, initialHeight));
};

const toolbar = () => {
  const element = document.querySelector('[data-slot=data-table-toolbar]');
  if (!(element instanceof HTMLElement)) throw new Error('No toolbar.');
  return element;
};

describe('DataTableToolbar layout', () => {
  it.each([{ direction: 'ltr' as const }, { direction: 'rtl' as const }])(
    'holds its content in a narrow page with a large font, $direction',
    async ({ direction }) => {
      await viewport(340);
      document.documentElement.style.fontSize = '120%';
      onTestFinished(() => {
        document.documentElement.style.fontSize = '';
      });
      await render(
        <DirectionProvider direction={direction}>
          <div dir={direction}>
            <Layout initial={{ status: 'active', tags: ['vip'] }} />
          </div>
        </DirectionProvider>
      );
      await expect.element(chip('Tags')).toBeVisible();

      const frame = toolbar().getBoundingClientRect();
      expect(toolbar().scrollWidth).toBeLessThanOrEqual(toolbar().clientWidth);
      for (const element of toolbar().querySelectorAll('*')) {
        const box = element.getBoundingClientRect();
        // A visually hidden live region is a pixel wide, a pixel outside: it shows nothing.
        if (box.width === 0 || element.classList.contains('sr-only')) continue;
        expect(box.left).toBeGreaterThanOrEqual(frame.left - 0.5);
        expect(box.right).toBeLessThanOrEqual(frame.right + 0.5);
      }
    }
  );

  it("keeps the app's actions on the first line as the filters wrap", async () => {
    await viewport(760);
    await render(<Layout initial={{ status: 'active', tags: ['vip'] }} />);
    const search = page.getByRole('textbox', { name: 'Search' });
    const exportButton = page.getByRole('button', { name: 'Export' });
    await expect.element(exportButton).toBeVisible();
    const firstLine = () => toolbar().getBoundingClientRect().top;
    const top = (locator: typeof search) =>
      locator.element().getBoundingClientRect().top;

    await addFilter('Amount');
    await userEvent.keyboard('{Escape}');
    await expect.element(chip('Amount')).toBeVisible();

    // The filters wrapped onto another line, and the actions stayed on the first.
    const reset = page.getByRole('button', { name: 'Clear filters' });
    expect(top(reset) - firstLine()).toBeGreaterThan(30);
    expect(top(exportButton) - firstLine()).toBeLessThan(8);
    expect(top(search) - firstLine()).toBeLessThan(8);
  });
});

describe('DataTableFilterChip in French', () => {
  it('sets a narrow no-break space before the colon of its title', async () => {
    await i18next.changeLanguage('fr');
    onTestFinished(async () => {
      await i18next.changeLanguage('en');
    });
    await render(chipOf({}, { value: 'ada', open: false }));

    const trigger = page.getByRole('group').getByRole('button').first();
    await expect.element(trigger).toBeVisible();
    // Read raw: the matchers fold every space into a plain one.
    expect(trigger.element().textContent).toContain('Owner\u202f:');
  });
});

describe('DataTableToolbar focus on the search', () => {
  const search = () =>
    page.getByRole('textbox', { name: 'Search' }).element() as HTMLInputElement;

  it('focuses the search after a removal, its text left as it is', async () => {
    await setup({ q: 'ada', status: 'active' });

    await page
      .getByRole('button', { name: 'Remove the Status filter' })
      .click();

    await expect.element(search()).toHaveFocus();
    expect(search().selectionStart).toBe(search().selectionEnd);
  });

  it('selects the text of the search a column header asks for', async () => {
    await setup({ q: 'ada' });

    await page.getByRole('button', { name: 'Search instead' }).click();

    await expect.element(search()).toHaveFocus();
    expect([search().selectionStart, search().selectionEnd]).toEqual([0, 3]);
  });
});

describe('DataTableFilterChip look', () => {
  it('shows its button can be clicked, and lights it up on hover', async () => {
    await setup({ status: 'active' });
    const trigger = chipText('Status');
    await expect.element(trigger).toBeVisible();
    const element = trigger.element();
    // The pointer may rest where an earlier test left it: it leaves the chip first.
    await page.getByRole('button', { name: 'Export' }).hover();
    await expect.poll(() => element.getAnimations().length).toBe(0);
    const rest = getComputedStyle(element).backgroundColor;

    expect(getComputedStyle(element).cursor).toBe('pointer');
    await trigger.hover();
    await expect
      .poll(() => getComputedStyle(element).backgroundColor)
      .not.toBe(rest);
  });
});

describe('DataTableFilterChip at phone width', () => {
  it('keeps a long summary on one line, inside the toolbar', async () => {
    await viewport(375);
    function Long() {
      const store = useMemoryDataTableStore<State>({ tags: ['vip', 'beta'] });
      const table = useDataTable({
        store,
        defaultSorting: { column: 'name', direction: 'asc' },
        filters: {
          tags: multiSelectFilter({
            title: 'Tags',
            options: [
              { value: 'vip', label: 'Very important people of the year' },
              { value: 'beta', label: 'Beta testers of the new release' },
            ],
          }),
        },
      });
      return <DataTableToolbar table={table} />;
    }
    await render(<Long />);
    const trigger = chipText('Tags');
    await expect.element(trigger).toBeVisible();

    const element = trigger.element();
    expect(element.scrollHeight).toBeLessThanOrEqual(element.clientHeight + 1);
    const box = chip('Tags').element().getBoundingClientRect();
    expect(box.height).toBeLessThanOrEqual(33);
    expect(box.right).toBeLessThanOrEqual(
      toolbar().getBoundingClientRect().right + 0.5
    );
  });
});

describe('DataTableFilterChip of several options', () => {
  it('ticks its options in boxes, empty when unticked, filled with a check when ticked', async () => {
    await setup({ tags: ['vip'] });
    await chip('Tags').getByRole('button').first().click();
    const box = (name: string) => {
      const found = page
        .getByRole('menuitemcheckbox', { name })
        .element()
        .querySelector<HTMLElement>('span[aria-hidden]');
      if (found === null) throw new Error(`No box for ${name}.`);
      return found;
    };
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'VIP' }))
      .toBeVisible();

    const empty = getComputedStyle(box('Beta'));
    expect(empty.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(empty.borderTopWidth).toBe('1px');
    expect(box('Beta').querySelector('svg')).toBeNull();
    expect(getComputedStyle(box('VIP')).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );
    expect(box('VIP').querySelector('svg')).not.toBeNull();
  });
});
