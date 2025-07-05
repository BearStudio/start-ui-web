import { Radio as RadioPrimitive } from '@base-ui-components/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui-components/react/radio-group';
import { cva } from 'class-variance-authority';
import { Circle } from 'lucide-react';
import * as React from 'react';

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

const radioVariants = cva(
  'flex flex-none cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted-foreground disabled:opacity-20 aria-invalid:focus-visible:ring-destructive/50 data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border data-indeterminate:border-primary/20 data-unchecked:border data-unchecked:border-primary/20 aria-invalid:data-unchecked:border-destructive',
  {
    variants: {
      size: {
        default: 'size-5 [&_svg]:size-2.5',
        sm: 'size-4 [&_svg]:size-2',
        lg: 'size-6 [&_svg]:size-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type RadioGroupProps = RadioGroupPrimitive.Props;

export function RadioGroup({ className, ...rest }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      className={cn('flex flex-col gap-2', className)}
      {...rest}
    />
  );
}

export type RadioProps = RadioPrimitive.Root.Props & {
  /**
   * By default, the radio is wrapped in a `<label>`. Set to `false` if you do not want it.
   */
  noLabel?: boolean;
  labelProps?: React.ComponentProps<'label'>;
  size?: 'default' | 'sm' | 'lg';
};

export function Radio({
  children,
  className,
  noLabel,
  labelProps,
  size,
  ...rest
}: RadioProps) {
  const Comp = noLabel ? React.Fragment : 'label';

  const compProps = noLabel
    ? {}
    : {
        ...labelProps,
        className: cn(labelVariants({ size }), labelProps?.className),
      };

  return (
    <Comp {...compProps}>
      <RadioPrimitive.Root
        className={cn(radioVariants({ size }), className)}
        {...rest}
      >
        <RadioPrimitive.Indicator
          keepMounted={true}
          className={cn(
            'flex transition-transform duration-150 ease-in-out',
            'data-checked:scale-100 data-unchecked:invisible data-unchecked:scale-75'
          )}
        >
          <Circle className="fill-current" />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
      {children}
    </Comp>
  );
}
