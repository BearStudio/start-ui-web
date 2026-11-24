import {
  Menu as MenuPrimitive,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '@ui-sdk/react/menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

const DropdownMenu = MenuPrimitive;

const DropdownMenuTrigger = MenuTrigger;

function DropdownMenuContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  ...props
}: Narrowed<React.ComponentProps<typeof MenuContent>>) {
  return (
    <MenuContent
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      className={cn(
        'max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
}

const DropdownMenuGroup = MenuGroup;

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: Narrowed<React.ComponentProps<typeof MenuItem>> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <MenuItem
      data-inset={inset}
      data-variant={variant}
      destructive={variant === 'destructive'}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof MenuCheckboxItem>>) {
  return (
    <MenuCheckboxItem
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MenuItemIndicator className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <CheckIcon aria-hidden="true" className="size-4" />
      </MenuItemIndicator>
      {children}
    </MenuCheckboxItem>
  );
}

const DropdownMenuRadioGroup = MenuRadioGroup;

function DropdownMenuRadioItem({
  className,
  children,
  icon,
  ...props
}: Narrowed<React.ComponentProps<typeof MenuRadioItem>> & {
  icon?: React.ReactNode;
}) {
  return (
    <MenuRadioItem
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MenuItemIndicator className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {icon ?? (
          <CircleIcon aria-hidden="true" className="size-2 fill-current" />
        )}
      </MenuItemIndicator>
      {children}
    </MenuRadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: Narrowed<React.ComponentProps<typeof MenuGroupLabel>> & {
  inset?: boolean;
}) {
  return (
    <MenuGroupLabel
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof MenuSeparator>>) {
  return (
    <MenuSeparator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/dropdown-menu-item:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

const DropdownMenuSub = MenuSub;

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof MenuSubTrigger>> & {
  inset?: boolean;
}) {
  return (
    <MenuSubTrigger
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />
    </MenuSubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  side = 'right',
  sideOffset = -4,
  align = 'start',
  ...props
}: Narrowed<React.ComponentProps<typeof MenuSubContent>>) {
  return (
    <MenuSubContent
      side={side}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'min-w-32 origin-(--transform-origin) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
