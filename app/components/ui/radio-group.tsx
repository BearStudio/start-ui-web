import { Radio as RadioPrimitive } from '@base-ui-components/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui-components/react/radio-group';
import { Circle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

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
};

export function Radio({
  children,
  className,
  noLabel,
  labelProps,
  ...rest
}: RadioProps) {
  const Comp = noLabel ? React.Fragment : 'label';

  const compProps = noLabel
    ? {}
    : {
        ...labelProps,
        className: cn('flex items-center gap-2 text-sm', labelProps?.className),
      };

  return (
    <Comp {...compProps}>
      <RadioPrimitive.Root
        className={cn(
          'peer size-4 cursor-pointer rounded-full border border-primary text-primary ring-offset-background',
          'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...rest}
      >
        <RadioPrimitive.Indicator
          keepMounted={true}
          className={cn(
            'flex items-center justify-center transition-transform duration-150 ease-in-out',
            'data-checked:visible data-checked:scale-100 data-unchecked:invisible data-unchecked:scale-75'
          )}
        >
          <Circle className="size-2.5 fill-current text-current" />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
      {children}
    </Comp>
  );
}
