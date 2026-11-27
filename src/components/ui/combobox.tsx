import type { ChangeDetails } from '@ui-sdk/core';
import {
  Combobox as ComboboxPrimitive,
  ComboboxChip as ComboboxChipPrimitive,
  ComboboxChipRemove,
  ComboboxChips as ComboboxChipsPrimitive,
  ComboboxClear as ComboboxClearPrimitive,
  ComboboxContent as ComboboxContentPrimitive,
  ComboboxEmpty as ComboboxEmptyPrimitive,
  ComboboxGroup as ComboboxGroupPrimitive,
  ComboboxGroupLabel,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxItem as ComboboxItemPrimitive,
  ComboboxItemIndicator,
  ComboboxList as ComboboxListPrimitive,
  type ComboboxProps,
  ComboboxSeparator as ComboboxSeparatorPrimitive,
  ComboboxTrigger as ComboboxTriggerPrimitive,
  ComboboxValue as ComboboxValuePrimitive,
  type ComboboxValueChangeReason,
  type ComboboxValueState,
  type ListItem,
} from '@ui-sdk/react/combobox';
import { cva, VariantProps } from 'class-variance-authority';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { buttonVariants } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

type Narrowed<P> = Omit<P, 'className' | 'children'> & {
  className?: string;
  children?: React.ReactNode;
};

type ComboboxChangeEventDetails = ChangeDetails<ComboboxValueChangeReason>;

function Combobox<T = string, Multiple extends boolean | undefined = false>(
  props: ComboboxProps<T, Multiple>
): React.JSX.Element {
  return <ComboboxPrimitive<T, Multiple> autoHighlight {...props} />;
}

function ComboboxValue({
  children,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxValuePrimitive>, 'children'> & {
  children?:
    | React.ReactNode
    | ((value: ExplicitAny, state: ComboboxValueState) => React.ReactNode);
}) {
  return (
    <ComboboxValuePrimitive {...props}>
      {typeof children === 'function'
        ? (state) => children(state.value, state)
        : children}
    </ComboboxValuePrimitive>
  );
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxTriggerPrimitive>>) {
  return (
    <ComboboxTriggerPrimitive
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none size-4 text-muted-foreground"
      />
    </ComboboxTriggerPrimitive>
  );
}

function ComboboxClear({
  className,
  ...props
}: Omit<
  Narrowed<React.ComponentProps<typeof ComboboxClearPrimitive>>,
  'children'
>) {
  const { t } = useTranslation(['components']);
  // ui-sdk unmounts Clear on a disabled combobox: keep it shown, disabled,
  // while there is a value.
  return (
    <ComboboxValuePrimitive>
      {({ value }) =>
        (Array.isArray(value) ? value.length > 0 : value != null) && (
          <ComboboxClearPrimitive
            keepMounted
            aria-label={t('components:combobox.clear')}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
              className
            )}
            {...props}
          >
            <XIcon aria-hidden="true" className="pointer-events-none" />
          </ComboboxClearPrimitive>
        )
      }
    </ComboboxValuePrimitive>
  );
}

function ComboboxInput({
  className,
  children,
  size,
  disabled = false,
  showTrigger = true,
  showClear = false,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInputPrimitive>, 'size'> &
  Pick<React.ComponentProps<typeof InputGroup>, 'size'> & {
    className?: string;
    children?: React.ReactNode;
    showTrigger?: boolean;
    showClear?: boolean;
  }) {
  const { t } = useTranslation(['components']);
  return (
    <InputGroup size={size} className={cn('w-auto', className)}>
      <ComboboxInputPrimitive
        render={<InputGroupInput />}
        disabled={disabled}
        placeholder={placeholder ?? t('components:combobox.placeholder')}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <ComboboxTriggerPrimitive
            aria-label={t('components:combobox.toggle')}
            disabled={disabled}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-xs' })
            )}
          >
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none size-4 text-muted-foreground"
            />
          </ComboboxTriggerPrimitive>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function useAnchor(
  anchor: React.RefObject<HTMLElement | null> | undefined
): React.ComponentProps<typeof ComboboxContentPrimitive>['anchor'] {
  return React.useMemo(
    () =>
      anchor && {
        getBoundingClientRect: () =>
          anchor.current?.getBoundingClientRect() ?? new DOMRect(),
      },
    [anchor]
  );
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: Omit<
  Narrowed<React.ComponentProps<typeof ComboboxContentPrimitive>>,
  'anchor'
> & {
  anchor?: React.RefObject<HTMLElement | null>;
}) {
  const virtualAnchor = useAnchor(anchor);
  return (
    <ComboboxContentPrimitive
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      anchor={virtualAnchor}
      data-chips={!!anchor}
      className={cn(
        'group/combobox-content max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 transition duration-100 [--list-height:var(--available-height)] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2 data-[side=top]:data-starting-style:translate-y-2',
        className
      )}
      {...props}
    />
  );
}

function ComboboxList<TItem extends ListItem<ExplicitAny>>({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof ComboboxListPrimitive>,
  'className' | 'children'
> & {
  className?: string;
  children?: React.ReactNode | ((item: TItem) => React.ReactNode);
}) {
  return (
    <ComboboxListPrimitive
      className={cn(
        'no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--list-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1',
        className
      )}
      {...props}
    >
      {typeof children === 'function'
        ? (state) =>
            state.items.map((entry) =>
              typeof entry === 'object' && 'value' in entry
                ? children(entry as TItem)
                : null
            )
        : children}
    </ComboboxListPrimitive>
  );
}

function ComboboxItem<T = string>({
  className,
  children,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxItemPrimitive<T>>>) {
  return (
    <ComboboxItemPrimitive<T>
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon aria-hidden="true" className="pointer-events-none" />
      </ComboboxItemIndicator>
    </ComboboxItemPrimitive>
  );
}

function ComboboxGroup({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxGroupPrimitive>>) {
  return <ComboboxGroupPrimitive className={cn(className)} {...props} />;
}

function ComboboxLabel({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxGroupLabel>>) {
  return (
    <ComboboxGroupLabel
      className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function ComboboxEmpty({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxEmptyPrimitive>>) {
  return (
    <ComboboxEmptyPrimitive
      className={cn(
        'hidden w-full justify-center py-2 text-center text-sm text-muted-foreground data-empty:flex',
        className
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxSeparatorPrimitive>>) {
  return (
    <ComboboxSeparatorPrimitive
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

const comboboxChipsVariants = cva(
  cn(
    'flex flex-wrap items-center gap-1 rounded-md border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40'
  ),
  {
    variants: {
      size: {
        default: cn(
          'min-h-9 has-data-[slot=combobox-chip]:px-1.5 [&_input]:md:text-sm has-data-[slot=combobox-chip]:[&_input]:md:text-xs'
        ),
        sm: cn(
          'min-h-8 has-data-[slot=combobox-chip]:px-1 [&_input]:md:text-sm has-data-[slot=combobox-chip]:[&_input]:md:text-xs'
        ),
        lg: cn(
          'min-h-10 has-data-[slot=combobox-chip]:px-2 [&_input]:md:text-base has-data-[slot=combobox-chip]:[&_input]:md:text-sm'
        ),
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

function ComboboxChips({
  className,
  size,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxChipsPrimitive>> &
  VariantProps<typeof comboboxChipsVariants>) {
  return (
    <ComboboxChipsPrimitive
      className={cn(comboboxChipsVariants({ size }), className)}
      {...props}
    />
  );
}

function ComboboxChip<T = string>({
  className,
  children,
  showRemove = true,
  ...props
}: Narrowed<React.ComponentProps<typeof ComboboxChipPrimitive<T>>> & {
  showRemove?: boolean;
}) {
  const { t } = useTranslation(['components']);
  return (
    <ComboboxChipPrimitive<T>
      className={cn(
        'flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-data-[slot=combobox-chip-remove]:pr-0 data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxChipRemove
          aria-label={t('components:combobox.removeItem')}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
            '-ml-1 opacity-50 hover:opacity-100'
          )}
        >
          <XIcon aria-hidden="true" className="pointer-events-none" />
        </ComboboxChipRemove>
      )}
    </ComboboxChipPrimitive>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInputPrimitive>, 'className'> & {
  className?: string;
}) {
  return (
    <ComboboxInputPrimitive
      className={cn('min-w-16 flex-1 px-0.5 text-base outline-none', className)}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  type ComboboxChangeEventDetails,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  type ComboboxProps,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
