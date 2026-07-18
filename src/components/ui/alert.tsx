import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'border-negative-200 bg-negative-50 text-negative-800 *:data-[slot=alert-description]:text-negative-900/80 dark:border-negative-900 dark:bg-negative-950/40 dark:text-negative-100 dark:*:data-[slot=alert-description]:text-negative-200/80',
        warning:
          'border-warning-200 bg-warning-50 text-warning-800 *:data-[slot=alert-description]:text-warning-900/80 dark:border-warning-900 dark:bg-warning-950/40 dark:text-warning-100 dark:*:data-[slot=alert-description]:text-warning-200/80',
        positive:
          'border-positive-200 bg-positive-50 text-positive-800 *:data-[slot=alert-description]:text-positive-900/80 dark:border-positive-900 dark:bg-positive-950/40 dark:text-positive-100 dark:*:data-[slot=alert-description]:text-positive-200/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
