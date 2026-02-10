import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/tailwind/utils';

import { Spinner } from '@/components/ui/spinner';

const buttonVariants = cva(
  "relative inline-flex w-fit max-w-full min-w-0 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 disabled:grayscale aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-40 data-disabled:grayscale dark:disabled:opacity-20 dark:aria-invalid:ring-destructive/40 dark:data-disabled:opacity-20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:gap-2",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 [a:hover_&]:bg-primary/90 [button:hover_&]:bg-primary/90',
        secondary:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground [a:hover_&]:bg-accent [a:hover_&]:text-accent-foreground dark:[a:hover_&]:bg-accent dark:[a:hover_&]:text-accent-foreground [button:hover_&]:bg-accent [button:hover_&]:text-accent-foreground dark:[button:hover_&]:bg-accent dark:[button:hover_&]:text-accent-foreground',
        ghost:
          'hover:bg-black/5 dark:hover:bg-white/10 [a:hover_&]:bg-black/5 dark:[a:hover_&]:bg-white/10 [button:hover_&]:bg-black/5 dark:[button:hover_&]:bg-white/10',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a:hover_&]:bg-destructive/90 [a:hover_&]:text-destructive-foreground dark:[a:hover_&]:bg-destructive/90 dark:[a:hover_&]:text-destructive-foreground [button:hover_&]:bg-destructive/90 [button:hover_&]:text-destructive-foreground dark:[button:hover_&]:bg-destructive/90 dark:[button:hover_&]:text-destructive-foreground',
        'destructive-secondary':
          'border bg-background text-negative-600 shadow-xs hover:border-transparent hover:bg-destructive/90 hover:text-destructive-foreground dark:text-negative-400 dark:hover:text-destructive-foreground [a:hover_&]:bg-destructive/90 [a:hover_&]:text-destructive-foreground dark:[a:hover_&]:bg-destructive/90 dark:[a:hover_&]:text-destructive-foreground [button:hover_&]:bg-destructive/90 [button:hover_&]:text-destructive-foreground dark:[button:hover_&]:bg-destructive/90 dark:[button:hover_&]:text-destructive-foreground',

        link: 'underline-offset-4 hover:underline [a:hover_&]:underline [button:hover_&]:underline',
      },
      size: {
        default: 'h-9 px-4 has-[>span>svg]:px-3',
        xs: "h-6 rounded-sm px-2 text-xs has-[>span>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3 [&>span]:gap-1",
        sm: 'h-8 px-3 has-[>span>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>span>svg]:px-4',
        icon: 'size-9 max-w-none',
        'icon-xs':
          "size-6 max-w-none rounded-sm text-xs [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 max-w-none',
        'icon-lg': 'size-10 max-w-none',
      },
    },
    compoundVariants: [
      {
        variant: ['link'],
        size: ['xs', 'sm', 'default', 'lg'],
        class: 'px-0 has-[>span>svg]:px-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

function Button({
  className,
  children,
  variant,
  size,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      {...props}
    >
      {!!loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
      <span
        className={cn(
          'flex min-w-0 flex-1 items-center justify-center',
          loading && 'opacity-0'
        )}
      >
        {children}
      </span>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
