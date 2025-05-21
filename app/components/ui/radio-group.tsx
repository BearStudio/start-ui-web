'use client';

import { Circle } from 'lucide-react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

type RadioProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  containerProps?: React.ComponentProps<'div'>;
  labelProps?: React.ComponentProps<'label'>;
};
function Radio({
  containerProps,
  labelProps,
  className,
  value,
  children,
  id,
  ...props
}: RadioProps) {
  const _id = React.useId();
  const radioId = id ?? _id;

  return (
    <div
      {...containerProps}
      className={cn('flex items-center space-x-2', containerProps?.className)}
    >
      <RadioGroupPrimitive.Item
        className={cn(
          'peer aspect-square h-4 w-4 cursor-pointer rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        id={radioId}
        value={value}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <label
        htmlFor={radioId}
        {...labelProps}
        className={cn(
          'cursor-pointer text-xs peer-disabled:cursor-not-allowed',
          labelProps?.className
        )}
      >
        {children}
      </label>
    </div>
  );
}

/**
 * Component holding the radio button.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/radio-group
 */
const RadioItem = RadioGroupPrimitive.Item;

export { Radio, RadioGroup, RadioItem };
export type { RadioGroupProps, RadioProps };
