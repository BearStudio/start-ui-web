import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs',
        className
      )}
      {...props}
    />
  );
}

/**
 * `left` / `right` are physical sides. `inline-start` / `inline-end` follow
 * the writing direction (`inline-end` is the right side in LTR and the left
 * side in RTL), which is what most sheets want.
 */
const sheetContentVariants = cva(
  'fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 h-auto border-b data-ending-style:-translate-y-10 data-starting-style:-translate-y-10',
        bottom:
          'inset-x-0 bottom-0 h-auto border-t data-ending-style:translate-y-10 data-starting-style:translate-y-10',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-ending-style:-translate-x-10 data-starting-style:-translate-x-10 sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-ending-style:translate-x-10 data-starting-style:translate-x-10 sm:max-w-sm',
        'inline-start':
          'inset-y-0 start-0 h-full w-3/4 border-e data-ending-style:-translate-x-10 data-starting-style:-translate-x-10 sm:max-w-sm rtl:data-ending-style:translate-x-10 rtl:data-starting-style:translate-x-10',
        'inline-end':
          'inset-y-0 end-0 h-full w-3/4 border-s data-ending-style:translate-x-10 data-starting-style:translate-x-10 sm:max-w-sm rtl:data-ending-style:-translate-x-10 rtl:data-starting-style:-translate-x-10',
      },
    },
    defaultVariants: {
      side: 'inline-end',
    },
  }
);

function SheetContent({
  className,
  children,
  side = 'inline-end',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props &
  VariantProps<typeof sheetContentVariants> & {
    showCloseButton?: boolean;
  }) {
  const { t } = useTranslation(['components']);

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetContentVariants({ side }), className)}
        initialFocus
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute end-3 top-3"
                size="icon-sm"
              >
                <XIcon />
                <span className="sr-only">{t('components:sheet.close')}</span>
              </Button>
            }
          />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-0.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-base font-medium text-foreground', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
