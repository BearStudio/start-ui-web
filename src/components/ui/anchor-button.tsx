import { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

import { buttonVariants } from '@/components/ui/button';

/**
 * A plain `<a>` with the look of a button, for a link that knows no router: its `href` and `onClick` come from
 * elsewhere, such as a store of `DataTable`. For a link of the app's routes, use `ButtonLink`. It stays an `<a>`, so
 * assistive tech announces a link. A disabled one has no `href` and does nothing on a click, and keeps the role of a
 * link through `role`.
 */
export function AnchorButton({
  className,
  variant,
  size,
  disabled = false,
  href,
  onClick,
  children,
  ...props
}: React.ComponentProps<'a'> &
  VariantProps<typeof buttonVariants> & { disabled?: boolean }) {
  return (
    <a
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
      {...(disabled
        ? {
            role: 'link',
            'aria-disabled': true,
            onClick: (event: React.MouseEvent<HTMLAnchorElement>) =>
              event.preventDefault(),
          }
        : { href, onClick })}
    >
      <span className="flex min-w-0 flex-1 items-center justify-center">
        {children}
      </span>
    </a>
  );
}
