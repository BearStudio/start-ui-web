import { describe, expect, it } from 'vitest';

import { Separator } from '@/components/ui/separator';

import { page, render, setupUser } from '@/tests/utils';

describe('Separator', () => {
  it('is announced as a horizontal separator by default', async () => {
    await render(<Separator />);
    const separator = page.getByRole('separator');

    await expect
      .element(separator)
      .toHaveAttribute('aria-orientation', 'horizontal');
    await expect
      .element(separator)
      .toHaveAttribute('data-orientation', 'horizontal');
    await expect.element(separator).toHaveAttribute('data-slot', 'separator');
  });

  it('is announced as vertical with orientation="vertical"', async () => {
    await render(<Separator orientation="vertical" />);
    const separator = page.getByRole('separator');

    await expect
      .element(separator)
      .toHaveAttribute('aria-orientation', 'vertical');
    await expect
      .element(separator)
      .toHaveAttribute('data-orientation', 'vertical');
  });

  it('is skipped by assistive technology when decorative', async () => {
    await render(<Separator decorative />);

    await expect.element(page.getByRole('separator')).not.toBeInTheDocument();
    const line = page.getByRole('none');
    await expect.element(line).not.toHaveAttribute('aria-orientation');
    await expect
      .element(line)
      .toHaveAttribute('data-orientation', 'horizontal');
  });

  it('is never a tab stop', async () => {
    const user = setupUser();
    await render(
      <div>
        <button type="button">Before</button>
        <Separator />
        <button type="button">After</button>
      </div>
    );

    await user.tab();
    await user.tab();
    await expect
      .element(page.getByRole('button', { name: 'After' }))
      .toHaveFocus();
  });
});
