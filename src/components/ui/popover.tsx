import {
  Popover as PopoverPrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
} from '@ui-sdk/react/popover';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

const Popover = PopoverPrimitive;

const PopoverTrigger = PopoverTriggerPrimitive;

function PopoverContent({
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: Narrowed<React.ComponentProps<typeof PopoverContentPrimitive>>) {
  return (
    <PopoverContentPrimitive
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        'flex w-72 origin-(--transform-origin) flex-col gap-4 rounded-lg bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden transition duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2 data-[side=top]:data-starting-style:translate-y-2',
        className
      )}
      {...props}
    />
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-1 text-sm', className)}
      {...props}
    />
  );
}

function PopoverTitle({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof PopoverTitlePrimitive>>) {
  return (
    <PopoverTitlePrimitive
      className={cn('font-medium', className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof PopoverDescriptionPrimitive>>) {
  return (
    <PopoverDescriptionPrimitive
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
