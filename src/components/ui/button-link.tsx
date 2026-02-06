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
      <span className={'flex min-w-0 flex-1 items-center justify-center'}>
        {children}
      </span>
    </Link>
  );
}

export { ButtonLink };
