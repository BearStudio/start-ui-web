import {
  Drawer as DrawerPrimitive,
  DrawerBackdrop,
  DrawerClose as DrawerClosePrimitive,
  DrawerContent as DrawerContentPrimitive,
  DrawerDescription as DrawerDescriptionPrimitive,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerTrigger as DrawerTriggerPrimitive,
} from '@ui-sdk/react/drawer';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

function Drawer({
  side = 'bottom',
  ...props
}: React.ComponentProps<typeof DrawerPrimitive>) {
  return <DrawerPrimitive side={side} {...props} />;
}

const DrawerTrigger = DrawerTriggerPrimitive;

const DrawerClose = DrawerClosePrimitive;

function DrawerOverlay({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof DrawerBackdrop>>) {
  return (
    <DrawerBackdrop
      className={cn(
        'fixed inset-0 bg-black/30 supports-backdrop-filter:backdrop-blur-xs',
        className
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof DrawerContentPrimitive>>) {
  return (
    <>
      <DrawerOverlay />
      <DrawerContentPrimitive
        className={cn(
          'group/drawer-content flex flex-col bg-background data-dragging:select-none',
          'data-[side=bottom]:max-h-[80vh] data-[side=bottom]:w-full data-[side=bottom]:rounded-t-xl data-[side=bottom]:border-t data-[side=bottom]:pb-safe-bottom',
          'data-[side=top]:max-h-[80vh] data-[side=top]:w-full data-[side=top]:rounded-b-xl data-[side=top]:border-b data-[side=top]:pt-safe-top',
          'data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:rounded-r-xl data-[side=left]:border-r data-[side=left]:ps-safe-left data-[side=left]:sm:max-w-sm',
          'data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:rounded-l-xl data-[side=right]:border-l data-[side=right]:pe-safe-right data-[side=right]:sm:max-w-sm',
          className
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-4 hidden h-1.5 w-25 shrink-0 rounded-full bg-muted group-data-[side=bottom]/drawer-content:block"
        />
        {children}
      </DrawerContentPrimitive>
    </>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[side=top]/drawer-content:text-center md:gap-1.5',
        className
      )}
      {...props}
    />
  );
}

function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn('flex flex-col px-4', className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof DrawerTitlePrimitive>>) {
  return (
    <DrawerTitlePrimitive
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof DrawerDescriptionPrimitive>>) {
  return (
    <DrawerDescriptionPrimitive
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
};
