import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

describe('Button', () => {
  it('lets an agent find and press it by name', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    await render(
      <div>
        <Button onClick={onSave}>Save changes</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
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
    expect(labels).toContain('Save changes');
    expect(labels).toContain('Cancel');

    const result = await agent.act({
      steps: [{ ref: 'Save changes', action: 'press' }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onSave).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('is pressed with Enter and Space once focused with Tab', async () => {
    const user = setupUser();
    const onClick = vi.fn();
    await render(<Button onClick={onClick}>Save</Button>);
    const button = page.getByRole('button', { name: 'Save' });

    await user.tab();
    await expect.element(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders a native button that does not submit or report a disabled state', async () => {
    await render(<Button>Save</Button>);
    const button = page.getByRole('button', { name: 'Save' });

    await expect.element(button).toHaveAttribute('type', 'button');
    await expect.element(button).toHaveAttribute('data-slot', 'button');
    await expect.element(button).not.toHaveAttribute('aria-disabled');
    await expect.element(button).not.toHaveAttribute('data-disabled');
    await expect.element(button).toBeEnabled();
  });

  it('submits its form with type="submit"', async () => {
    const user = setupUser();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    await render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Subscribe</Button>
      </form>
    );

    await user.click(page.getByRole('button', { name: 'Subscribe' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('cannot be focused or pressed when disabled', async () => {
    const user = setupUser();
    const onClick = vi.fn();
    await render(
      <div>
        <Button disabled onClick={onClick}>
          Delete
        </Button>
        <Button>Next</Button>
      </div>
    );
    const button = page.getByRole('button', { name: 'Delete' });

    await expect.element(button).toBeDisabled();
    await expect.element(button).toHaveAttribute('data-disabled');
    await user.tab();
    await expect
      .element(page.getByRole('button', { name: 'Next' }))
      .toHaveFocus();
    await user.click(button, { force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is disabled while loading and keeps its name', async () => {
    const user = setupUser();
    const onClick = vi.fn();
    await render(
      <Button loading onClick={onClick}>
        Save
      </Button>
    );
    const button = page.getByRole('button', { name: 'Save' });

    await expect.element(button).toBeDisabled();
    await user.click(button, { force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('stays pending while the Promise returned by onClick runs', async () => {
    const user = setupUser();
    let resolve = () => {};
    const onClick = vi.fn(
      () => new Promise<void>((done) => (resolve = () => done()))
    );
    await render(<Button onClick={onClick}>Load more</Button>);
    const button = page.getByRole('button', { name: 'Load more' });

    await user.click(button);
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    await expect.element(button).toHaveAttribute('aria-disabled', 'true');
    await expect.element(button).toHaveFocus();
    await user.click(button, { force: true });
    expect(onClick).toHaveBeenCalledOnce();

    resolve();
    await expect.element(button).not.toHaveAttribute('aria-busy');
  });

  it('stays a link when rendered as an anchor', async () => {
    await render(<Button render={<a href="/docs" />}>Documentation</Button>);
    const link = page.getByRole('link', { name: 'Documentation' });

    await expect.element(link).toHaveAttribute('href', '/docs');
    await expect.element(link).not.toHaveAttribute('type');
    await expect.element(link).not.toHaveAttribute('role');
  });

  it('acts as a button when rendered as a non-interactive element', async () => {
    const user = setupUser();
    const onClick = vi.fn();
    await render(
      <Button render={<span />} onClick={onClick}>
        Edit
      </Button>
    );
    const button = page.getByRole('button', { name: 'Edit' });

    await user.tab();
    await expect.element(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('works as the element of a Base UI trigger', async () => {
    const user = setupUser();
    await render(
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>
          Open details
        </PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Details</PopoverTitle>
        </PopoverContent>
      </Popover>
    );
    const trigger = page.getByRole('button', { name: 'Open details' });

    await user.click(trigger);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(page.getByText('Details')).toBeVisible();
    await user.keyboard('{Escape}');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).toHaveFocus();
  });
});
