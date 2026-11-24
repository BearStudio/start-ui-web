import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '@/components/ui/checkbox';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

describe('Checkbox', () => {
  it('lets an agent find and check it by its label', async () => {
    const onCheckedChange = vi.fn();
    await render(
      <div>
        <Checkbox onCheckedChange={onCheckedChange}>I love bears</Checkbox>
        <Checkbox noLabel aria-label="Notify me" />
      </div>
    );

    const components = agent.snapshot().filter((entry) => !entry.offPage);
    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }
    const labels = components.map((entry) => entry.label);
    expect(labels).toContain('I love bears');
    expect(labels).toContain('Notify me');

    const result = await agent.act({
      steps: [{ ref: 'I love bears', action: 'setChecked', args: [true] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    await expect
      .element(page.getByRole('checkbox', { name: 'I love bears' }))
      .toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ source: 'agent' })
    );
  });

  it('toggles with Space and with a click on its label', async () => {
    const user = setupUser();
    await render(<Checkbox>I love bears</Checkbox>);
    const checkbox = page.getByRole('checkbox', { name: 'I love bears' });

    await user.tab();
    await expect.element(checkbox).toHaveFocus();
    await user.keyboard(' ');
    await expect.element(checkbox).toBeChecked();
    await expect.element(checkbox).toHaveAttribute('data-checked');

    await user.click(page.getByText('I love bears'));
    await expect.element(checkbox).not.toBeChecked();
    await expect.element(checkbox).toHaveAttribute('data-unchecked');
  });

  it('is announced as mixed when indeterminate', async () => {
    await render(
      <Checkbox defaultChecked="indeterminate">I love bears</Checkbox>
    );
    const checkbox = page.getByRole('checkbox', { name: 'I love bears' });

    await expect.element(checkbox).toHaveAttribute('aria-checked', 'mixed');
    await expect.element(checkbox).toHaveAttribute('data-indeterminate');
  });

  it('keeps an aria-label when rendered without a label', async () => {
    await render(<Checkbox noLabel aria-label="Notify me" />);
    const checkbox = page.getByRole('checkbox', { name: 'Notify me' });

    await expect.element(checkbox).not.toHaveAttribute('aria-labelledby');
    await expect.element(checkbox).not.toHaveAttribute('aria-disabled');
  });

  it('submits its name and value only while checked', async () => {
    const user = setupUser();
    const submitted = vi.fn();
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted([...new FormData(event.currentTarget)]);
        }}
      >
        <Checkbox name="bears" value="yes">
          I love bears
        </Checkbox>
        <button type="submit">Send</button>
      </form>
    );

    await user.click(page.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenLastCalledWith([]);

    await user.click(page.getByRole('checkbox', { name: 'I love bears' }));
    await user.click(page.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenLastCalledWith([['bears', 'yes']]);
  });

  it('cannot be focused or changed when disabled', async () => {
    const user = setupUser();
    await render(
      <div>
        <Checkbox disabled>I love bears</Checkbox>
        <button type="button">After</button>
      </div>
    );
    const checkbox = page.getByRole('checkbox', { name: 'I love bears' });

    await expect.element(checkbox).toBeDisabled();
    await user.tab();
    await expect
      .element(page.getByRole('button', { name: 'After' }))
      .toHaveFocus();
  });
});
