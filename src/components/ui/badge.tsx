import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/tailwind/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 self-center overflow-hidden rounded-full border border-transparent font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/80',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
        negative:
          'bg-negative-100 text-negative-800 dark:bg-negative-500/25 dark:text-negative-100 [a&]:hover:bg-negative-200 dark:[a&]:hover:bg-negative-500/35',
        warning:
          'bg-warning-100 text-warning-800 dark:bg-warning-500/25 dark:text-warning-100 [a&]:hover:bg-warning-200 dark:[a&]:hover:bg-warning-500/35',
        positive:
          'bg-positive-100 text-positive-800 dark:bg-positive-500/25 dark:text-positive-100 [a&]:hover:bg-positive-200 dark:[a&]:hover:bg-positive-500/35',
      },
      size: {
        default: 'h-6 px-2 text-xs',
        xs: 'h-4 px-1.5 text-3xs [&>svg]:size-2',
        sm: 'h-5 px-2 text-2xs',
        lg: 'h-7 px-3 text-sm [&>svg]:size-4',
        icon: 'size-6',
        'icon-xs': 'size-4 [&>svg]:size-2',
        'icon-sm': 'size-5',
        'icon-lg': 'size-7 [&>svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  size,
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant, size, className })),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
