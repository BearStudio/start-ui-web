import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import { Radio, RadioGroup } from '@/components/ui/radio-group';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

const bears = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
];

const Bears = (props: React.ComponentProps<typeof RadioGroup>) => (
  <RadioGroup aria-label="Astrobear" {...props}>
    {bears.map((bear) => (
      <Radio key={bear.value} value={bear.value}>
        {bear.label}
      </Radio>
    ))}
  </RadioGroup>
);

describe('RadioGroup', () => {
  it('lets an agent pick an option by its label', async () => {
    const onValueChange = vi.fn();
    await render(<Bears onValueChange={onValueChange} />);

    const components = agent.snapshot().filter((entry) => !entry.offPage);
    const group = components.find((entry) => entry.label === 'Astrobear');
    expect(group?.items?.map((item) => item.label)).toEqual(
      bears.map((bear) => bear.label)
    );

    const result = await agent.act({
      steps: [{ ref: 'Astrobear', action: 'setValue', args: ['Buzz Pawdrin'] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    await expect
      .element(page.getByRole('radio', { name: 'Buzz Pawdrin' }))
      .toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith(
      'pawdrin',
      expect.objectContaining({ source: 'agent' })
    );
  });

  it('has one tab stop and moves the selection with arrow keys', async () => {
    const user = setupUser();
    await render(<Bears defaultValue="pawdrin" />);

    await expect
      .element(page.getByRole('radiogroup', { name: 'Astrobear' }))
      .toBeInTheDocument();
    await user.tab();
    await expect
      .element(page.getByRole('radio', { name: 'Buzz Pawdrin' }))
      .toHaveFocus();

    await user.keyboard('{ArrowDown}');
    const last = page.getByRole('radio', { name: 'Yuri Grizzlyrin' });
    await expect.element(last).toHaveFocus();
    await expect.element(last).toBeChecked();
    await expect.element(last).toHaveAttribute('data-checked');

    await user.keyboard('{ArrowUp}');
    await expect
      .element(page.getByRole('radio', { name: 'Buzz Pawdrin' }))
      .toBeChecked();
    await expect.element(last).toHaveAttribute('data-unchecked');
  });

  it('submits the checked value under its name', async () => {
    const user = setupUser();
    const submitted = vi.fn();
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted([...new FormData(event.currentTarget)]);
        }}
      >
        <Bears name="bear" />
        <button type="submit">Send</button>
      </form>
    );

    await user.click(page.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenLastCalledWith([]);

    await user.click(page.getByText('Yuri Grizzlyrin'));
    await user.click(page.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenLastCalledWith([['bear', 'grizzlyrin']]);
  });
});
