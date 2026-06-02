import { Button as ButtonPrimitive } from '@base-ui/react/button';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/platform/lib/tailwind/utils';

import { buttonVariants } from '@/platform/components/ui/button-variants';
import { Spinner } from '@/platform/components/ui/spinner';

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

export { Button };
