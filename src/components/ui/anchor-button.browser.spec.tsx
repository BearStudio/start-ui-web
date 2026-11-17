import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AnchorButton } from '@/components/ui/anchor-button';

import { render } from '@/tests/utils';

describe('AnchorButton', () => {
  it('is a link to its href, which runs its onClick', async () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <AnchorButton href="/next" onClick={onClick}>
        Next
      </AnchorButton>
    );

    const link = page.getByRole('link', { name: 'Next' });
    await expect.element(link).toHaveAttribute('href', '/next');
    await link.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('once disabled, has no href, says so, looks it, and does nothing on a click', async () => {
    const onClick = vi.fn();
    await render(
      <AnchorButton href="/next" onClick={onClick} disabled>
        Next
      </AnchorButton>
    );

    const link = page.getByRole('link', { name: 'Next' });
    await expect.element(link).toHaveAttribute('aria-disabled', 'true');
    const element = link.element() as HTMLAnchorElement;
    expect(element.hasAttribute('href')).toBe(false);
    expect(getComputedStyle(element).opacity).toBe('0.4');
    expect(getComputedStyle(element).pointerEvents).toBe('none');

    // Pointer events are off: a click from script still reaches it.
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    element.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});
