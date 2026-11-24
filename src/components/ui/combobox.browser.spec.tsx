import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'grapes', label: 'Grapes' },
];

const Fruit = (
  props: React.ComponentProps<typeof Combobox<string, false>> & {
    showClear?: boolean;
  }
) => (
  <Combobox items={fruits} {...props}>
    <ComboboxInput aria-label="Fruit" showClear={props.showClear} />
    <ComboboxContent>
      <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      <ComboboxList>
        {(item: (typeof fruits)[number]) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);

const Fruits = (props: {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}) => {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={fruits} {...props} multiple>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: string[], { labels }) =>
            values.map((value, index) => (
              <ComboboxChip key={value} value={value}>
                {labels[index]}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label="Fruits" />
        <ComboboxClear />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {(item: (typeof fruits)[number]) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

describe('Combobox', () => {
  it('lets an agent find and choose an item by its label', async () => {
    const onValueChange = vi.fn();
    await render(<Fruit onValueChange={onValueChange} />);

    const components = agent.snapshot().filter((entry) => !entry.offPage);
    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }
    expect(components.map((entry) => entry.label)).toContain('Fruit');

    const result = await agent.act({
      steps: [{ ref: 'Fruit', action: 'setValue', args: ['Grapes'] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith(
      'grapes',
      expect.objectContaining({ source: 'agent' })
    );
    await expect
      .element(page.getByRole('combobox', { name: 'Fruit' }))
      .toHaveValue('Grapes');
  });

  it('highlights the first match while typing, so Enter chooses it', async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    await render(<Fruit onValueChange={onValueChange} />);
    const input = page.getByRole('combobox', { name: 'Fruit' });

    await user.type(input, 'b');
    const listbox = page.getByRole('listbox', { name: 'Fruit' });
    await expect.element(listbox).toBeVisible();
    expect(listbox.element().closest(':popover-open')).not.toBeNull();
    await expect
      .element(page.getByRole('option', { name: 'Apple' }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole('option', { name: 'Banana' }))
      .toHaveAttribute('data-highlighted');

    await user.keyboard('{ArrowDown}');
    await expect
      .element(page.getByRole('option', { name: 'Blueberry' }))
      .toHaveAttribute('data-highlighted');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith(
      'blueberry',
      expect.objectContaining({ reason: 'item-press' })
    );
    await expect.element(input).toHaveValue('Blueberry');
    await expect.element(input).toHaveFocus();
  });

  it('shows its empty message when nothing matches', async () => {
    const user = setupUser();
    await render(<Fruit />);

    await user.type(page.getByRole('combobox', { name: 'Fruit' }), 'zz');
    await expect.element(page.getByText('No fruit found.')).toBeVisible();
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('clears to null with its named Clear button', async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    await render(
      <Fruit defaultValue="apple" showClear onValueChange={onValueChange} />
    );

    await user.click(page.getByRole('button', { name: 'Clear' }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'clear-press' })
    );
    await expect
      .element(page.getByRole('combobox', { name: 'Fruit' }))
      .toHaveValue('');
  });

  it('toggles items into an array and removes the last chip with Backspace', async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    await render(
      <Fruits defaultValue={['apple']} onValueChange={onValueChange} />
    );
    const input = page.getByRole('combobox', { name: 'Fruits' });

    await user.click(input);
    await user.click(page.getByRole('option', { name: 'Grapes' }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['apple', 'grapes'],
      expect.anything()
    );
    await expect
      .element(page.getByRole('option', { name: 'Grapes' }))
      .toHaveAttribute('data-selected');
    await expect.element(page.getByRole('listbox')).toBeVisible();

    await user.keyboard('{Escape}');
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['apple'],
      expect.anything()
    );
    await expect
      .element(page.getByRole('group', { name: 'Grapes' }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole('group', { name: 'Apple' }))
      .toBeInTheDocument();
  });
});
