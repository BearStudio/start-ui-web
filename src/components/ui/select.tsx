import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectGroupLabel,
  SelectItem as SelectItemPrimitive,
  SelectItemIndicator,
  SelectItemText,
  type SelectProps,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
} from '@ui-sdk/react/select';
import { cva, VariantProps } from 'class-variance-authority';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

const Select = SelectPrimitive;

function SelectGroup({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectGroupPrimitive>>) {
  return (
    <SelectGroupPrimitive
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  );
}

function SelectValue({
  className,
  placeholder,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectValuePrimitive>>) {
  const { t } = useTranslation(['components']);
  return (
    <SelectValuePrimitive
      className={cn('min-w-0 flex-1 truncate text-left', className)}
      placeholder={placeholder ?? t('components:select.placeholder')}
      {...props}
    />
  );
}

const selectTriggerVariants = cva(
  'flex w-full min-w-0 items-center justify-between gap-1.5 rounded-md border border-input bg-white whitespace-nowrap shadow-xs transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      size: {
        default: cn('h-9 px-3 text-sm'),
        sm: cn('h-8 px-2.5 text-sm'),
        lg: cn('h-10 px-4 text-base'),
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectTriggerPrimitive>> &
  VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectTriggerPrimitive
      data-size={size}
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none size-4 text-muted-foreground"
      />
    </SelectTriggerPrimitive>
  );
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectContentPrimitive>>) {
  return (
    <SelectContentPrimitive
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      data-align-trigger={alignItemWithTrigger}
      className={cn(
        'max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </SelectContentPrimitive>
  );
}

function SelectLabel({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectGroupLabel>>) {
  return (
    <SelectGroupLabel
      className={cn('px-1.5 py-1 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function SelectItem<T = string>({
  className,
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectItemPrimitive<T>>>) {
  return (
    <SelectItemPrimitive<T>
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectItemText className="flex min-w-0 flex-1 shrink-0 items-center gap-2">
        {children}
      </SelectItemText>
      <SelectItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon aria-hidden="true" className="pointer-events-none" />
      </SelectItemIndicator>
    </SelectItemPrimitive>
  );
}

function SelectSeparator({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof SelectSeparatorPrimitive>>) {
  return (
    <SelectSeparatorPrimitive
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

export type { SelectProps };
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
