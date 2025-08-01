import { useMeasure } from '@uidotdev/usehooks';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

const inputVariants = cva(
  cn(
    'relative flex w-full min-w-0 items-center overflow-hidden rounded-md border border-input bg-background/80 text-base text-foreground shadow-xs transition-[color,box-shadow] md:text-sm',
    'selection:bg-primary selection:text-primary-foreground',
    '[&>input]:placeholder:text-muted-foreground',
    'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
    'has-[[aria-invalid]]:border-destructive has-[[aria-invalid]]:ring-destructive/20 dark:has-[[aria-invalid]]:ring-destructive/40',
    '[&>input]:disabled:opacity-50'
  ),
  {
    variants: {
      size: {
        default: 'h-9 [&>div]:px-2.5 [&>input]:px-3',
        sm: 'h-8 [&>div]:px-2 [&>input]:px-2.5',
        lg: 'h-10 md:text-base [&>div]:px-3 [&>input]:px-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type InputProps = Pick<
  React.ComponentProps<'input'>,
  | 'type'
  | 'className'
  | 'placeholder'
  | 'id'
  | 'value'
  | 'defaultValue'
  | 'disabled'
  | 'readOnly'
  | 'aria-invalid'
  | 'aria-describedby'
  | 'autoFocus'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'onBlur'
  | 'onChange'
  | 'onKeyDown'
  | 'inputMode'
> &
  VariantProps<typeof inputVariants> & {
    ref?: React.Ref<HTMLInputElement | null>;
    startElement?: React.ReactNode;
    endElement?: React.ReactNode;
    inputClassName?: string;
  };

const startEndElementClassNames = (className?: string) =>
  cn(
    'absolute top-0 bottom-0 flex items-center justify-center text-muted-foreground',
    'pointer-events-none *:not-[svg]:pointer-events-auto',
    "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1em]",
    className
  );

function Input({
  ref,
  className,
  inputClassName,
  type,
  startElement,
  endElement,
  size,
  ...props
}: InputProps) {
  const [startElementRef, { width: startElementWidth }] = useMeasure();
  const [endElementRef, { width: endElementWidth }] = useMeasure();
  return (
    <div className={cn(inputVariants({ size }), className)}>
      {!!startElement && (
        <div
          ref={startElementRef}
          className={startEndElementClassNames('left-0')}
        >
          {startElement}
        </div>
      )}
      <input
        {...props}
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'flex h-full w-full outline-none',
          'disabled:cursor-not-allowed',
          'read-only:cursor-not-allowed read-only:opacity-50',
          inputClassName
        )}
        style={{
          paddingLeft: startElementWidth ?? undefined,
          paddingRight: endElementWidth ?? undefined,
        }}
      />
      {!!endElement && (
        <div
          ref={endElementRef}
          className={startEndElementClassNames('right-0')}
        >
          {endElement}
        </div>
      )}
    </div>
  );
}

export { Input };
