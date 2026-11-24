import {
  Dialog as DialogPrimitive,
  DialogBackdrop,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from '@ui-sdk/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

const Dialog = DialogPrimitive;

const DialogTrigger = DialogTriggerPrimitive;

const DialogClose = DialogClosePrimitive;

function DialogOverlay({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof DialogBackdrop>>) {
  return (
    <DialogBackdrop
      className={cn(
        'fixed inset-0 bg-black/30 duration-100 data-ending-style:animate-out data-ending-style:fade-out-0 data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-xs',
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  hideCloseButton,
  ...props
}: Narrowed<React.ComponentProps<typeof DialogContentPrimitive>> & {
  hideCloseButton?: boolean;
}) {
  const { t } = useTranslation(['components']);

  return (
    <>
      <DialogOverlay />
      <DialogContentPrimitive
        // `left-1/2 -translate-x-1/2` centers the content regardless of the
        // writing direction, so it is kept physical on purpose (RTL safe).
        className={cn(
          'fixed top-1/2 left-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 sm:max-w-sm',
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogClosePrimitive
            aria-label={t('components:dialog.close')}
            render={
              <Button
                variant="ghost"
                className="absolute end-2 top-2"
                size="icon-sm"
              />
            }
          >
            <XIcon aria-hidden="true" />
          </DialogClosePrimitive>
        )}
      </DialogContentPrimitive>
    </>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  const { t } = useTranslation(['components']);

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClosePrimitive render={<Button variant="ghost" />}>
          {t('components:dialog.close')}
        </DialogClosePrimitive>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof DialogTitlePrimitive>>) {
  return (
    <DialogTitlePrimitive
      className={cn('text-base leading-none font-medium', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof DialogDescriptionPrimitive>>) {
  return (
    <DialogDescriptionPrimitive
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
};
