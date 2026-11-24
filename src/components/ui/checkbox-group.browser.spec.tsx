import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

const bears = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
];

const Bears = (props: React.ComponentProps<typeof CheckboxGroup>) => (
  <CheckboxGroup aria-label="Astrobears" {...props}>
    {bears.map((bear) => (
      <Checkbox key={bear.value} value={bear.value}>
        {bear.label}
      </Checkbox>
    ))}
  </CheckboxGroup>
);

describe('CheckboxGroup', () => {
  it('lets an agent set the checked values by the group name', async () => {
    const onValueChange = vi.fn();
    await render(<Bears onValueChange={onValueChange} />);

    const group = agent
      .snapshot()
      .filter((entry) => !entry.offPage)
      .find((entry) => entry.label === 'Astrobears');
    expect(group?.actions).toContain('setValue');

    const result = await agent.act({
      steps: [{ ref: 'Astrobears', action: 'setValue', args: [['pawdrin']] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['pawdrin'],
      expect.objectContaining({ source: 'agent' })
    );
    await expect
      .element(page.getByRole('checkbox', { name: 'Buzz Pawdrin' }))
      .toBeChecked();
  });

  it('is a named group that reports values in checkbox order', async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    await render(<Bears onValueChange={onValueChange} />);

    await expect
      .element(page.getByRole('group', { name: 'Astrobears' }))
      .toBeInTheDocument();
    await user.click(page.getByRole('checkbox', { name: 'Yuri Grizzlyrin' }));
    await user.click(page.getByRole('checkbox', { name: 'Bearstrong' }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['bearstrong', 'grizzlyrin'],
      expect.objectContaining({ reason: 'item-press' })
    );
  });

  it('submits every checked value under its name and resets to its default', async () => {
    const user = setupUser();
    const submitted = vi.fn();
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted([...new FormData(event.currentTarget)]);
        }}
      >
        <Bears name="bears" defaultValue={['pawdrin']} />
        <button type="submit">Send</button>
        <button type="reset">Reset</button>
      </form>
    );

    await user.click(page.getByRole('checkbox', { name: 'Bearstrong' }));
    await user.click(page.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenLastCalledWith([
      ['bears', 'bearstrong'],
      ['bears', 'pawdrin'],
    ]);

    await user.click(page.getByRole('button', { name: 'Reset' }));
    await expect
      .element(page.getByRole('checkbox', { name: 'Bearstrong' }))
      .not.toBeChecked();
    await expect
      .element(page.getByRole('checkbox', { name: 'Buzz Pawdrin' }))
      .toBeChecked();
  });

  it('disables every checkbox when disabled', async () => {
    await render(<Bears disabled />);

    for (const bear of bears) {
      await expect
        .element(page.getByRole('checkbox', { name: bear.label }))
        .toBeDisabled();
    }
  });
});
