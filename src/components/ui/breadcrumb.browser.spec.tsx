import { describe, expect, it, vi } from 'vitest';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { page, render, setupUser } from '@/tests/utils';

describe('Breadcrumb', () => {
  it('names its landmark and marks the current page', async () => {
    await render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/books">Books</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dune</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    await expect
      .element(page.getByRole('navigation', { name: 'breadcrumb' }))
      .toBeInTheDocument();
    const link = page.getByRole('link', { name: 'Books' });
    await expect.element(link).toHaveAttribute('href', '/books');
    await expect.element(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    await expect
      .element(page.getByRole('link', { name: 'Dune' }))
      .toHaveAttribute('aria-current', 'page');
  });

  it('runs the caller handler and keeps classes with a custom element', async () => {
    const user = setupUser();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <BreadcrumbLink
        className="font-bold"
        onClick={onClick}
        render={<a href="/users" data-testid="custom" />}
      >
        Users
      </BreadcrumbLink>
    );
    const link = page.getByRole('link', { name: 'Users' });

    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    await expect.element(link).toHaveAttribute('data-testid', 'custom');
    await expect
      .element(link)
      .toHaveClass('font-bold', 'hover:text-foreground');
  });
});
