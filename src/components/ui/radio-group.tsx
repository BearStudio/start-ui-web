import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cva } from 'class-variance-authority';
import { Circle } from 'lucide-react';
import { Fragment, useId } from 'react';

import { cn } from '@/lib/tailwind/utils';

const labelVariants = cva(
  'flex items-start gap-2.5 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-40',
  {
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
  }
);

const radioVariants = cva(
  'flex flex-none cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:focus-visible:ring-destructive/50 data-checked:bg-primary data-checked:text-primary-foreground data-disabled:cursor-not-allowed data-disabled:bg-muted-foreground data-disabled:opacity-40 data-indeterminate:border data-unchecked:border aria-invalid:data-unchecked:border-destructive',
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
  const Comp = noLabel ? Fragment : 'label';
  const _compId = useId();
  const id = labelProps?.id ?? _compId;
  const compProps = noLabel
    ? {}
    : {
        ...labelProps,
        id,
        className: cn(labelVariants({ size }), labelProps?.className),
      };

  return (
    <Comp {...compProps}>
      <RadioPrimitive.Root
        className={cn(radioVariants({ size }), className)}
        aria-labelledby={id}
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
