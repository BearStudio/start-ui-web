import { Checkbox as CheckboxPrimitive } from '@base-ui-components/react/checkbox';
import { cva } from 'class-variance-authority';
import { CheckIcon, MinusIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/tailwind/utils';

const labelVariants = cva('flex items-start gap-2.5 text-primary', {
  variants: {
    size: {
      default: 'text-sm',
      sm: 'gap-2 text-xs',
      lg: 'gap-3 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const checkboxVariants = cva(
  'flex flex-none cursor-pointer items-center justify-center rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted-foreground disabled:opacity-20 aria-invalid:focus-visible:ring-destructive/50 data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border data-indeterminate:border-primary/20 data-unchecked:border data-unchecked:border-primary/20 aria-invalid:data-unchecked:border-destructive',
  {
    variants: {
      size: {
        default: 'size-5 [&_svg]:size-3.5 [&_svg]:stroke-3',
        sm: 'size-4 rounded-[5px] [&_svg]:size-2.5 [&_svg]:stroke-4',
        lg: 'size-6 [&_svg]:size-4 [&_svg]:stroke-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'type'> & {
  /**
   * By default, the checkbox is wrapped in a `<label>`. Set to `false` if you do not want it.
   */
  noLabel?: boolean;
  labelProps?: React.ComponentProps<'label'>;
  size?: 'default' | 'sm' | 'lg';
};

export function Checkbox({
  children,
  className,
  noLabel,
  labelProps,
  size,
  ...props
}: CheckboxProps) {
  const Comp = noLabel ? React.Fragment : 'label';

  const compProps = noLabel
    ? {}
    : {
        ...labelProps,
        className: cn(labelVariants({ size }), labelProps?.className),
      };

  return (
    <Comp {...compProps}>
      <CheckboxPrimitive.Root
        className={cn(checkboxVariants({ size }), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          keepMounted={true}
          className={cn(
            'flex transition-transform duration-150 ease-in-out',
            'data-checked:scale-100 data-unchecked:invisible data-unchecked:scale-75'
          )}
          render={(props, state) => (
            <span {...props}>
              {state.indeterminate ? <MinusIcon /> : <CheckIcon />}
            </span>
          )}
        />
      </CheckboxPrimitive.Root>
      {children}
    </Comp>
  );
}
