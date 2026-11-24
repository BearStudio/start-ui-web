import { describe, expect, it } from 'vitest';

import { Badge } from '@/components/ui/badge';

import { page, render } from '@/tests/utils';

describe('Badge', () => {
  it('renders a span with its slot, variant and size', async () => {
    await render(
      <Badge variant="warning" size="sm">
        Beta
      </Badge>
    );
    const badge = page.getByText('Beta');

    expect(badge.element().tagName).toBe('SPAN');
    await expect.element(badge).toHaveAttribute('data-slot', 'badge');
    await expect.element(badge).toHaveAttribute('data-variant', 'warning');
    await expect.element(badge).toHaveAttribute('data-size', 'sm');
    await expect.element(badge).toHaveClass('bg-warning-100', 'h-5');
  });

  it('leaves out the variant and size attributes it was not given', async () => {
    await render(<Badge>New</Badge>);
    const badge = page.getByText('New');

    await expect.element(badge).not.toHaveAttribute('data-variant');
    await expect.element(badge).not.toHaveAttribute('data-size');
    await expect.element(badge).toHaveClass('bg-primary', 'h-6');
  });

  it('renders the element passed to render and keeps its own props', async () => {
    await render(
      <Badge
        variant="secondary"
        className="ms-2"
        render={<a href="/changelog" className="underline" />}
      >
        Changelog
      </Badge>
    );
    const link = page.getByRole('link', { name: 'Changelog' });

    await expect.element(link).toHaveAttribute('href', '/changelog');
    await expect.element(link).toHaveAttribute('data-slot', 'badge');
    await expect.element(link).toHaveClass('bg-secondary', 'ms-2', 'underline');
  });
});
