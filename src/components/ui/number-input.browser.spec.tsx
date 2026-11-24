import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import { NumberInput } from '@/components/ui/number-input';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

describe('NumberInput', () => {
  it('lets an agent set and step its value by its label', async () => {
    const onValueChange = vi.fn();
    await render(
      <NumberInput
        aria-label="Bearcoins"
        defaultValue={2}
        buttons="classic"
        onValueChange={onValueChange}
      />
    );

    const components = agent.snapshot().filter((entry) => !entry.offPage);
    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }
    expect(components.map((entry) => entry.label)).toContain('Bearcoins');

    const result = await agent.act({
      steps: [
        { ref: 'Bearcoins', action: 'setValue', args: [10] },
        { ref: 'Bearcoins', action: 'increment' },
      ],
    });
    expect(result.ok, result.error?.message).toBe(true);
    await expect
      .element(page.getByRole('textbox', { name: 'Bearcoins' }))
      .toHaveValue('11');
    expect(onValueChange).toHaveBeenLastCalledWith(
      11,
      expect.objectContaining({ source: 'agent' })
    );
  });

  it('is labelled by id and steps with arrow keys and named buttons', async () => {
    const user = setupUser();
    await render(
      <div>
        <label htmlFor="balance">Balance</label>
        <NumberInput
          id="balance"
          aria-describedby="balance-help"
          defaultValue={4}
          buttons="mobile"
        />
        <p id="balance-help">In bearcoins</p>
      </div>
    );
    const input = page.getByRole('textbox', { name: 'Balance' });

    await expect
      .element(input)
      .toHaveAttribute('aria-describedby', 'balance-help');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    await expect.element(input).toHaveValue('5');

    await user.click(page.getByRole('button', { name: 'Decrease' }));
    await user.click(page.getByRole('button', { name: 'Decrease' }));
    await expect.element(input).toHaveValue('3');
    await user.click(page.getByRole('button', { name: 'Increase' }));
    await expect.element(input).toHaveValue('4');
  });

  it('commits typed text on Enter, clamped to its bounds', async () => {
    const user = setupUser();
    const onValueCommit = vi.fn();
    await render(
      <NumberInput
        aria-label="Bearcoins"
        min={0}
        max={10}
        onValueCommit={onValueCommit}
      />
    );
    const input = page.getByRole('textbox', { name: 'Bearcoins' });

    await user.type(input, '42{Enter}');
    await expect.element(input).toHaveValue('10');
    expect(onValueCommit).toHaveBeenLastCalledWith(10, expect.anything());
  });

  it('formats with its locale and submits the plain number', async () => {
    const user = setupUser();
    const submitted = vi.fn();
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted([...new FormData(event.currentTarget)]);
        }}
      >
        <NumberInput
          aria-label="Price"
          name="price"
          locale="fr"
          format={{ style: 'currency', currency: 'EUR' }}
          defaultValue={1234.5}
        />
        <button type="submit">Send</button>
      </form>
    );

    await expect
      .element(page.getByRole('textbox', { name: 'Price' }))
      .toHaveValue(
        new Intl.NumberFormat('fr', {
          style: 'currency',
          currency: 'EUR',
        }).format(1234.5)
      );
    await user.click(page.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenLastCalledWith([['price', '1234.5']]);
  });

  it('disables its step buttons when read-only', async () => {
    await render(
      <NumberInput aria-label="Bearcoins" readOnly buttons="mobile" />
    );

    await expect
      .element(page.getByRole('textbox', { name: 'Bearcoins' }))
      .toHaveAttribute('readonly');
    await expect
      .element(page.getByRole('button', { name: 'Increase' }))
      .toHaveAttribute('aria-disabled', 'true');
  });
});
