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
};
export function Radio({ children, className, noLabel, ...rest }: RadioProps) {
  const Comp = noLabel ? React.Fragment : 'label';

  const compProps = noLabel
    ? {}
    : {
        className: 'flex items-center gap-2',
      };
  return (
    <Comp {...compProps}>
      <RadioPrimitive.Root
        className={cn(
          'peer size-5 cursor-pointer rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...rest}
      >
        <RadioPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="size-3 fill-current text-current" />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
      {children}
    </Comp>
  );
}
