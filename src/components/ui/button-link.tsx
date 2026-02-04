import { Link, LinkProps } from '@tanstack/react-router';
import { VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { buttonVariants } from '@/components/ui/button';

function ButtonLink({
  className,
  children,
  variant,
  size,
  ...props
}: VariantProps<typeof buttonVariants> &
  ComponentProps<'a'> &
  LinkProps & { className?: string }) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </Link>
  );
}

export { ButtonLink };
