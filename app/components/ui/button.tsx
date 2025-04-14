import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Spinner } from '@/components/ui/spinner';

const buttonVariants = cva(
  "relative inline-flex w-fit shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 disabled:grayscale aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:disabled:opacity-20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        secondary:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-black/5 dark:hover:bg-white/10',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        'destructive-secondary':
          'border border-input bg-background text-negative-600 shadow-xs hover:border-transparent hover:bg-destructive/90 hover:text-destructive-foreground dark:text-negative-400 dark:hover:text-destructive-foreground',

        link: 'underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 has-[>svg]:px-3',
        xs: "h-7 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs':
          "size-7 rounded-sm text-xs [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    compoundVariants: [
      {
        variant: ['link'],
        size: ['xs', 'sm', 'default', 'lg'],
        class: 'px-0 has-[>svg]:px-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> &
  (
    | {
        asChild?: false;
        loading?: boolean;
      }
    | { asChild: true }
  );

function Button(_props: ButtonProps) {
  const { className, variant, asChild, loading, size, disabled, ...props } =
    !_props.asChild ? _props : { ..._props, loading: false };
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </span>
          <span className="flex items-center justify-center gap-2 opacity-0">
            {props.children}
          </span>
        </>
      ) : (
        <Slottable>{props.children}</Slottable>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
