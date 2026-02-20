import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

const inputGroupVariants = cva(
  cn(
    'group/input-group relative flex w-full items-center rounded-md border border-input text-base shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
    'min-w-0',

    // Input
    '[&>input]:md:text-sm',

    // Textarea
    'has-[>textarea]:h-auto [&>textarea]:max-h-64 [&>textarea]:md:text-sm',

    // Variants based on alignment.
    'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col',
    'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col',

    // Disabled
    'has-[input:disabled]:cursor-not-allowed [&>input]:disabled:opacity-50',
    'has-[textarea:disabled]:cursor-not-allowed [&>textarea]:disabled:opacity-50',

    // Focus state.
    'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',

    // Error state.
    'has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40'
  ),
  {
    variants: {
      size: {
        default: cn(
          'h-9',
          // Input
          '[&>input]:px-3 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5',
          // Textarea
          '[&>textarea]:-my-px [&>textarea]:min-h-14 [&>textarea]:px-3 [&>textarea]:py-2 has-[>[data-align=block-end]]:[&>textarea]:pt-3 has-[>[data-align=block-start]]:[&>textarea]:pb-3'
        ),
        sm: cn(
          'h-8',
          // Input
          '[&>input]:px-2.5 has-[>[data-align=block-end]]:[&>input]:pt-2.5 has-[>[data-align=block-start]]:[&>input]:pb-2.5 has-[>[data-align=inline-end]]:[&>input]:pr-1 has-[>[data-align=inline-start]]:[&>input]:pl-1',
          // Textarea
          '[&>textarea]:-my-px [&>textarea]:max-h-64 [&>textarea]:min-h-12 [&>textarea]:px-2.5 [&>textarea]:py-1.5 has-[>[data-align=block-end]]:[&>textarea]:pt-2.5 has-[>[data-align=block-start]]:[&>textarea]:pb-2.5'
        ),
        lg: cn(
          'h-10 md:text-base',
          // Input
          '[&>input]:px-4 has-[>[data-align=block-end]]:[&>input]:pt-4 has-[>[data-align=block-start]]:[&>input]:pb-4 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=inline-start]]:[&>input]:pl-2',
          // Textarea
          '[&>textarea]:-my-px [&>textarea]:min-h-15 [&>textarea]:px-4 [&>textarea]:py-2.5 has-[>[data-align=block-end]]:[&>textarea]:pt-4 has-[>[data-align=block-start]]:[&>textarea]:pb-4'
        ),
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);
function InputGroup({
  className,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(inputGroupVariants({ size }), className)}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)]",
  {
    variants: {
      align: {
        'inline-start':
          'order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]',
        'inline-end':
          'order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]',
        'block-start':
          'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3',
        'block-end':
          'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.currentTarget.parentElement
          ?.querySelector<
            HTMLInputElement | HTMLTextAreaElement
          >('input, textarea')
          ?.focus();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.currentTarget.parentElement
            ?.querySelector<
              HTMLInputElement | HTMLTextAreaElement
            >('input, textarea')
            ?.focus();
        }
      }}
    />
  );
}

function InputGroupButton({
  type = 'button',
  size = 'xs',
  variant = 'ghost',
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type={type}
      data-size={size}
      size={size}
      variant={variant}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        'flex h-full w-full flex-1 rounded-none border-0 bg-transparent shadow-none outline-none focus-visible:ring-0 dark:bg-transparent',
        'read-only:cursor-not-allowed disabled:cursor-not-allowed',

        className
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<typeof TextareaAutosize>) {
  return (
    <TextareaAutosize
      data-slot="input-group-control"
      className={cn(
        'flex field-sizing-content w-full flex-1 resize-none rounded-none border-0 bg-transparent shadow-none outline-none focus-visible:ring-0 dark:bg-transparent',
        'read-only:cursor-not-allowed disabled:cursor-not-allowed',

        className
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
