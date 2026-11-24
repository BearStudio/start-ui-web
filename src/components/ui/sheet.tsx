import {
  Dialog as SheetPrimitive,
  DialogBackdrop as SheetBackdrop,
  DialogClose as SheetClosePrimitive,
  DialogContent as SheetContentPrimitive,
  DialogDescription as SheetDescriptionPrimitive,
  DialogTitle as SheetTitlePrimitive,
  DialogTrigger as SheetTriggerPrimitive,
} from '@ui-sdk/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

const Sheet = SheetPrimitive;

const SheetTrigger = SheetTriggerPrimitive;

const SheetClose = SheetClosePrimitive;

function SheetOverlay({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof SheetBackdrop>>) {
  return (
    <SheetBackdrop
      className={cn(
        'fixed inset-0 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs',
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
  'm-0 flex max-h-none max-w-none flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 bottom-auto h-auto w-auto border-b data-ending-style:-translate-y-10 data-starting-style:-translate-y-10',
        bottom:
          'inset-x-0 top-auto bottom-0 h-auto w-auto border-t data-ending-style:translate-y-10 data-starting-style:translate-y-10',
        left: 'inset-y-0 right-auto left-0 h-full w-3/4 border-r data-ending-style:-translate-x-10 data-starting-style:-translate-x-10 sm:max-w-sm',
        right:
          'inset-y-0 right-0 left-auto h-full w-3/4 border-l data-ending-style:translate-x-10 data-starting-style:translate-x-10 sm:max-w-sm',
        'inline-start':
          'inset-y-0 start-0 end-auto h-full w-3/4 border-e data-ending-style:-translate-x-10 data-starting-style:-translate-x-10 sm:max-w-sm rtl:data-ending-style:translate-x-10 rtl:data-starting-style:translate-x-10',
        'inline-end':
          'inset-y-0 start-auto end-0 h-full w-3/4 border-s data-ending-style:translate-x-10 data-starting-style:translate-x-10 sm:max-w-sm rtl:data-ending-style:-translate-x-10 rtl:data-starting-style:-translate-x-10',
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
}: Narrowed<React.ComponentProps<typeof SheetContentPrimitive>> &
  VariantProps<typeof sheetContentVariants> & {
    showCloseButton?: boolean;
  }) {
  const { t } = useTranslation(['components']);

  return (
    <>
      <SheetOverlay />
      <SheetContentPrimitive
        data-side={side}
        className={cn(sheetContentVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClosePrimitive
            aria-label={t('components:sheet.close')}
            render={
              <Button
                variant="ghost"
                className="absolute end-3 top-3"
                size="icon-sm"
              />
            }
          >
            <XIcon aria-hidden="true" />
          </SheetClosePrimitive>
        )}
      </SheetContentPrimitive>
    </>
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

function SheetTitle({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof SheetTitlePrimitive>>) {
  return (
    <SheetTitlePrimitive
      className={cn('text-base font-medium text-foreground', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof SheetDescriptionPrimitive>>) {
  return (
    <SheetDescriptionPrimitive
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
  SheetTitle,
  SheetTrigger,
};
