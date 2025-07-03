import { Checkbox as CheckboxPrimitive } from '@base-ui-components/react/checkbox';
import { CheckIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/tailwind/utils';

export type CheckboxProps = CheckboxPrimitive.Root.Props & {
  noLabel?: boolean;
};

export function Checkbox({
  children,
  className,
  noLabel,
  ...props
}: CheckboxProps) {
  const Comp = noLabel ? React.Fragment : 'label';

  const compProps = noLabel
    ? {}
    : {
        className: 'flex items-center gap-2 text-base text-primary',
      };

  return (
    <Comp {...compProps}>
      <CheckboxPrimitive.Root
        className={cn(
          'flex size-5 items-center justify-center rounded-sm outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'data-checked:bg-primary data-unchecked:border data-unchecked:border-primary/50',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          keepMounted={true}
          className={cn(
            'flex transition-transform duration-150 ease-in-out',
            'data-checked:scale-100 data-checked:rotate-0 data-unchecked:scale-50 data-unchecked:rotate-45'
          )}
        >
          <CheckIcon className="size-3.5 stroke-3 text-primary-foreground" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {children}
    </Comp>
  );
}
