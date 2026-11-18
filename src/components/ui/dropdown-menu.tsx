import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';

const itemIndicatorClassName = {
  // A mark before the label, in the margin of the item.
  start: 'ps-8 pe-2',
  // A check after the label, as the items of a `Select`.
  end: 'ps-2 pe-8',
  // A box before the label, empty until ticked: the items of a choice of several.
  checkbox: 'ps-8 pe-2',
  // No mark: the item shows its state itself, as an icon that toggles.
  none: 'px-2',
} as const;

const indicatorPositionClassName = {
  start: 'start-2',
  end: 'end-2',
  checkbox: 'start-2',
  none: '',
} as const;

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuPositioner({
  className,
  ...props
}: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Positioner
      data-slot="dropdown-menu-positioner"
      className={cn('isolate z-50 outline-none', className)}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  children,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'z-50 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  indicator = 'start',
  ...props
}: Omit<MenuPrimitive.CheckboxItem.Props, 'checked' | 'onCheckedChange'> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Where the check sits: before the label, after it as in a `Select`, in a box shown unticked too, which tells a
   * choice of several from a choice of one, or nowhere, for an item whose content shows its state (a toggled icon).
   */
  indicator?: 'start' | 'end' | 'checkbox' | 'none';
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "group/checkbox-item relative flex cursor-default items-center gap-2 rounded-sm py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        itemIndicatorClassName[indicator],
        className
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      {indicator === 'none' ? null : indicator === 'checkbox' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute start-2 flex size-4 items-center justify-center rounded-sm border border-input group-data-checked/checkbox-item:border-primary group-data-checked/checkbox-item:bg-primary group-data-checked/checkbox-item:text-primary-foreground"
        >
          <MenuPrimitive.CheckboxItemIndicator className="flex">
            <CheckIcon className="size-3" />
          </MenuPrimitive.CheckboxItemIndicator>
        </span>
      ) : (
        <MenuPrimitive.CheckboxItemIndicator
          className={cn(
            'pointer-events-none absolute flex size-3.5 items-center justify-center',
            indicatorPositionClassName[indicator]
          )}
        >
          <CheckIcon className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      )}
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  icon,
  indicator = 'start',
  ...props
}: MenuPrimitive.RadioItem.Props & {
  icon?: ReactNode;
  /** Where the mark sits: a dot before the label, or a check after it as in a `Select`. */
  indicator?: 'start' | 'end';
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        itemIndicatorClassName[indicator],
        className
      )}
      {...props}
    >
      <MenuPrimitive.RadioItemIndicator
        className={cn(
          'pointer-events-none absolute flex size-3.5 items-center justify-center',
          indicatorPositionClassName[indicator]
        )}
      >
        {icon ??
          (indicator === 'end' ? (
            <CheckIcon className="size-4" />
          ) : (
            <CircleIcon className="size-2 fill-current" />
          ))}
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
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
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
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
        'ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  side = 'right',
  sideOffset = -4,
  align = 'start',
  alignOffset = 0,
  children,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          className={cn(
            'z-50 min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuArrow({ className, ...props }: MenuPrimitive.Arrow.Props) {
  return (
    <MenuPrimitive.Arrow
      data-slot="dropdown-menu-arrow"
      className={cn(
        'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] border bg-popover data-[side=bottom]:top-0 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-2.5',
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
