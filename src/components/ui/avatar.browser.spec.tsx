import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { page, render } from '@/tests/utils';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const agent = createAgent();

describe('Avatar', () => {
  it('is named for an agent when it has role="img" and a label', async () => {
    await render(
      <Avatar role="img" aria-label="Ada Lovelace">
        <AvatarImage src={PIXEL} alt="" />
        <AvatarFallback variant="initials" name="Ada Lovelace" />
      </Avatar>
    );
    await expect
      .element(page.getByRole('img', { name: 'Ada Lovelace' }))
      .toBeInTheDocument();

    const components = agent.snapshot().filter((entry) => !entry.offPage);
    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }
    expect(components.map((entry) => entry.label)).toContain('Ada Lovelace');
  });

  it('replaces the fallback with the image once it loads', async () => {
    const onLoadingStatusChange = vi.fn();
    await render(
      <Avatar onLoadingStatusChange={onLoadingStatusChange}>
        <AvatarImage src={PIXEL} alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    );

    await expect
      .element(page.getByRole('img', { name: 'Ada Lovelace' }))
      .toBeVisible();
    await expect.element(page.getByText('AL')).not.toBeInTheDocument();
    expect(onLoadingStatusChange).toHaveBeenLastCalledWith(
      'loaded',
      expect.anything()
    );
  });

  it('keeps the initials when the image fails', async () => {
    const { container } = await render(
      <Avatar size="sm">
        <AvatarImage src="/missing-avatar.png" alt="Ada Lovelace" />
        <AvatarFallback variant="initials" name="Ada Lovelace" />
      </Avatar>
    );
    const avatar = container.querySelector('[data-slot="avatar"]');

    await expect.element(page.getByText('AL')).toBeVisible();
    await expect
      .element(page.getByRole('img', { name: 'Ada Lovelace' }))
      .not.toBeInTheDocument();
    await expect
      .poll(() => avatar?.getAttribute('data-loading-status'))
      .toBe('error');
    expect(avatar).toHaveAttribute('data-size', 'sm');
  });

  it('shows its fallback when there is no image', async () => {
    await render(
      <Avatar>
        <AvatarFallback variant="boring" name="Grace Hopper" />
      </Avatar>
    );

    await expect.element(page.getByText('GH')).toBeVisible();
  });
});
