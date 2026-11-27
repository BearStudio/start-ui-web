import { CheckboxGroup as CheckboxGroupPrimitive } from '@ui-sdk/react/checkbox';
import type * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

type CheckboxGroupProps<T extends string = string> = Omit<
  React.ComponentProps<typeof CheckboxGroupPrimitive<T>>,
  'className'
> & { className?: string };

export function CheckboxGroup<T extends string = string>({
  className,
  ...props
}: CheckboxGroupProps<T>) {
  return (
    <CheckboxGroupPrimitive<T>
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}
