import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'grapes', label: 'Grapes', disabled: true },
];

const Fruits = (props: {
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?: (value: string | null) => void;
}) => (
  <Select items={fruits} {...props}>
    <SelectTrigger aria-label="Fruit">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        {fruits.map((fruit) => (
          <SelectItem
            key={fruit.value}
            value={fruit.value}
            disabled={fruit.disabled}
          >
            {fruit.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

describe('Select', () => {
  it('lets an agent choose an item by its label', async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);

    const select = agent
      .snapshot()
      .filter((entry) => !entry.offPage)
      .find((entry) => entry.label === 'Fruit');
    expect(select?.items?.map((item) => item.label)).toEqual([
      'Apple',
      'Banana',
      'Grapes',
    ]);

    const result = await agent.act({
      steps: [{ ref: 'Fruit', action: 'setValue', args: ['Banana'] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith(
      'banana',
      expect.objectContaining({ source: 'agent' })
    );
    await expect
      .element(page.getByRole('combobox', { name: 'Fruit' }))
      .toHaveTextContent('Banana');
  });

  it('shows its placeholder until a value is chosen', async () => {
    await render(<Fruits />);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });

    await expect.element(trigger).toHaveTextContent('Select a fruit');
    await expect.element(trigger).toHaveAttribute('data-placeholder');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens in the top layer and picks with the keyboard, skipping disabled items', async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    await render(
      <Fruits defaultValue="banana" onValueChange={onValueChange} />
    );
    const trigger = page.getByRole('combobox', { name: 'Fruit' });

    await user.tab();
    await expect.element(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toBeVisible();
    expect(listbox.element().matches(':popover-open')).toBe(true);
    await expect
      .element(page.getByRole('group', { name: 'Fruits' }))
      .toBeInTheDocument();

    const banana = page.getByRole('option', { name: 'Banana' });
    await expect.element(banana).toHaveAttribute('data-selected');
    await expect.element(banana).toHaveAttribute('aria-selected', 'true');
    await expect
      .element(page.getByRole('option', { name: 'Grapes' }))
      .toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{ArrowUp}');
    await expect
      .element(page.getByRole('option', { name: 'Apple' }))
      .toHaveAttribute('data-highlighted');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith(
      'apple',
      expect.objectContaining({ source: 'keyboard' })
    );
    await expect.element(listbox).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveTextContent('Apple');
  });

  it('closes with Escape without changing its value', async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    await render(<Fruits defaultValue="apple" onValueChange={onValueChange} />);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });

    await user.click(trigger);
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await user.keyboard('{Escape}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('cannot open when disabled', async () => {
    await render(<Fruits disabled />);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });

    await expect.element(trigger).toBeDisabled();
    await expect.element(trigger).toHaveAttribute('data-disabled');
  });
});
