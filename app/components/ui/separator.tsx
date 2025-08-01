'use client';

import { Separator as SeparatorPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

const Separator = ({
  ref,
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<
    typeof SeparatorPrimitive.Root
  > | null>;
}) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-auto w-[1px]',
      className
    )}
    {...props}
  />
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
