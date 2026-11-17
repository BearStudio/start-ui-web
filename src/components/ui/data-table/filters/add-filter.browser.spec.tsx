import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DataTableAddFilter } from '@/components/ui/data-table/filters/add-filter';

import { render } from '@/tests/utils';

const filters = [
  { key: 'status', title: 'Status' },
  { key: 'team', title: 'Team' },
] as const;

const setup = async (
  shown: ReadonlyArray<{ key: string; title: string }> = filters
) => {
  const onAdd = vi.fn(() =>
    document.querySelector<HTMLInputElement>('#filter')?.focus()
  );
  await render(
    <>
      <DataTableAddFilter filters={shown} onAdd={onAdd} />
      <input id="filter" aria-label="Filter" />
    </>
  );
  return { onAdd, trigger: page.getByRole('button', { name: 'Add filter' }) };
};

describe('DataTableAddFilter', () => {
  it('lists the filters it can add, and adds the one chosen once the menu has closed', async () => {
    const { onAdd, trigger } = await setup();

    await trigger.click();
    await expect
      .element(page.getByRole('menuitem', { name: 'Status' }))
      .toBeVisible();
    await page.getByRole('menuitem', { name: 'Team' }).click();

    await expect.poll(() => onAdd).toHaveBeenCalledWith('team');
    expect(page.getByRole('menu').elements()).toHaveLength(0);
    await expect
      .element(page.getByRole('textbox', { name: 'Filter' }))
      .toHaveFocus();
  });

  it('adds nothing when the menu closes on Escape, and gives the focus back to the button', async () => {
    const { onAdd, trigger } = await setup();

    await trigger.click();
    await userEvent.keyboard('{Escape}');

    await expect.element(trigger).toHaveFocus();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows no button when no filter is left to add', async () => {
    await setup([]);

    await expect
      .element(page.getByRole('textbox', { name: 'Filter' }))
      .toBeVisible();
    expect(
      page.getByRole('button', { name: 'Add filter' }).elements()
    ).toHaveLength(0);
  });
});
