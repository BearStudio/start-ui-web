import { DrawerPreview as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/80 supports-backdrop-filter:backdrop-blur-xs',
        'opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'data-ending-style:opacity-0 data-starting-style:opacity-0',
        'data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*400ms)]',
        'data-swiping:duration-0',
        className
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  forceRenderOverlay,
  keepMounted,
  ...props
}: DrawerPrimitive.Popup.Props & {
  forceRenderOverlay?: boolean;
  keepMounted?: boolean;
}) {
  return (
    <DrawerPortal data-slot="drawer-portal" keepMounted={keepMounted}>
      <DrawerOverlay forceRender={forceRenderOverlay} />
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className="fixed inset-0 z-50"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            'group/drawer-content absolute flex h-auto flex-col bg-background',
            'transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)]',
            'data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*400ms)]',
            'data-swiping:duration-0 data-swiping:select-none',
            // Down
            'data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:border-t data-[swipe-direction=down]:pb-safe-bottom',
            'data-[swipe-direction=down]:transform-[translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
            'data-[swipe-direction=down]:data-starting-style:transform-[translateY(100%)]',
            'data-[swipe-direction=down]:data-ending-style:transform-[translateY(100%)]',
            // Up
            'data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:rounded-b-xl data-[swipe-direction=up]:border-b data-[swipe-direction=up]:pt-safe-top',
            'data-[swipe-direction=up]:transform-[translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
            'data-[swipe-direction=up]:data-starting-style:transform-[translateY(-100%)]',
            'data-[swipe-direction=up]:data-ending-style:transform-[translateY(-100%)]',
            // Left
            'data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-[swipe-direction=left]:ps-safe-left data-[swipe-direction=left]:sm:max-w-sm',
            'data-[swipe-direction=left]:transform-[translateX(var(--drawer-swipe-movement-x,0px))]',
            'data-[swipe-direction=left]:data-starting-style:transform-[translateX(-100%)]',
            'data-[swipe-direction=left]:data-ending-style:transform-[translateX(-100%)]',
            // Right
            'data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-[swipe-direction=right]:pe-safe-right data-[swipe-direction=right]:sm:max-w-sm',
            'data-[swipe-direction=right]:transform-[translateX(var(--drawer-swipe-movement-x,0px))]',
            'data-[swipe-direction=right]:data-starting-style:transform-[translateX(100%)]',
            'data-[swipe-direction=right]:data-ending-style:transform-[translateX(100%)]',
            className
          )}
          initialFocus
          {...props}
        >
          <div className="mx-auto mt-4 hidden h-1.5 w-25 shrink-0 rounded-full bg-muted group-data-[swipe-direction=down]/drawer-content:block" />
          <DrawerPrimitive.Content data-slot="drawer-inner-content">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[swipe-direction=up]/drawer-content:text-center md:gap-1.5',
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

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
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
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
