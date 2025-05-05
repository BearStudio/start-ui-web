import {
  Combobox,
  ComboboxRootProps,
  createListCollection,
} from '@ark-ui/react/combobox';
import { Portal } from '@ark-ui/react/portal';
import { ChevronDown, X } from 'lucide-react';
import { ComponentProps, ReactNode, useMemo, useState } from 'react';
import { isNonNullish, isNullish } from 'remeda';

import { cn } from '@/lib/tailwind/utils';
import { getUiState } from '@/lib/ui-state';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OptionBase = { value: string; label: string };

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder' | 'size'>;

/**
 * We override how Ark UI handle select, has this is a "single" select and it is
 * easier to plug as is with React Hook Form
 */
type ControlProps = {
  value?: string;
  defaultValue?: string;
  /** Listen for all the changes: new value, value change, clear */
  onChange?: (value: string | null | undefined) => void;
};

type SelectProps<Option extends OptionBase> = Overwrite<
  Omit<ComboboxRootProps<Option>, 'collection'>,
  ControlProps
> &
  InputPropsRoot & {
    withClearButton?: boolean;
    options: ReadonlyArray<Option>;
    inputProps?: RemoveFromType<InputProps, InputPropsRoot>;
    createListCollectionOptions?: Omit<
      Parameters<typeof createListCollection<Option>>[0],
      'items'
    >;
    renderEmpty?: (search: string) => ReactNode;
  };

export const Select = <Option extends OptionBase>({
  withClearButton,
  inputProps,
  size,
  placeholder = 'Select...', // TODO Translation
  options,
  createListCollectionOptions,
  onOpenChange,
  onInputValueChange,
  renderEmpty,
  onChange,
  value,
  defaultValue,
  ...props
}: SelectProps<Option>) => {
  const [items, setItems] = useState(options);
  const [search, setSearch] = useState('');

  const collection = useMemo(
    () => createListCollection({ items, ...createListCollectionOptions }),
    [createListCollectionOptions, items]
  );

  const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
    onInputValueChange?.(details);

    setSearch(details.inputValue);

    setItems(
      options.filter((item) =>
        item.label.toLowerCase().includes(details.inputValue.toLowerCase())
      )
    );
  };

  const handleOpenChange = (details: Combobox.OpenChangeDetails) => {
    onOpenChange?.(details);

    if (details.open) {
      setItems(options);
    }
  };

  const handleOnValueChange = (details: Combobox.ValueChangeDetails) => {
    if (details.value.length) {
      onChange?.(details.value.at(0));
    }

    props.onValueChange?.(details);
  };

  const ui = getUiState((set) => {
    if (collection.items.length === 0 && isNullish(renderEmpty))
      return set('empty');
    if (collection.items.length === 0 && isNonNullish(renderEmpty))
      return set('empty-override', { renderEmpty });
    if (collection.items.length !== 0) return set('default');
    return set('default');
  });

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={handleInputChange}
      onOpenChange={handleOpenChange}
      onValueChange={handleOnValueChange}
      openOnClick
      value={value ? [value] : undefined}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      inputValue={options.find((o) => o.value === value)?.label}
      inputBehavior="autohighlight"
      {...props}
    >
      <Combobox.Control>
        <Combobox.Input asChild>
          <Input
            size={size}
            endElement={
              <div className="flex gap-1">
                {!!withClearButton && (
                  <Combobox.ClearTrigger
                    onClick={() => {
                      onChange?.(null);
                    }}
                    asChild
                  >
                    <Button variant="ghost" size="icon-xs">
                      <X />
                    </Button>
                  </Combobox.ClearTrigger>
                )}
                <Combobox.Trigger asChild>
                  <Button
                    variant="ghost"
                    disabled={props.disabled || props.readOnly}
                    className="-me-1.5"
                    size="icon-xs"
                  >
                    <ChevronDown />
                  </Button>
                </Combobox.Trigger>
              </div>
            }
            placeholder={placeholder}
            {...inputProps}
          />
        </Combobox.Input>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content className="z-10 rounded-md bg-white p-1 shadow dark:bg-neutral-900">
            {ui
              .match('empty', () => <div className="p-4">No results found</div>)
              .match('empty-override', ({ renderEmpty }) => renderEmpty(search))
              .match('default', () => (
                <Combobox.ItemGroup className="flex flex-col gap-0.5">
                  {collection.items.slice(0, 20).map((item) => (
                    <Combobox.Item
                      key={item.value}
                      item={item}
                      className={cn(
                        'flex cursor-pointer gap-1 rounded-sm px-3 py-1.5 data-[disabled]:opacity-50',
                        'data-[highlighted]:bg-neutral-50 dark:data-[highlighted]:bg-neutral-800',
                        'data-[state=checked]:bg-neutral-100 dark:data-[state=checked]:bg-neutral-700',
                        'text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      )}
                    >
                      <Combobox.ItemText>{item.label}</Combobox.ItemText>
                    </Combobox.Item>
                  ))}
                </Combobox.ItemGroup>
              ))
              .exhaustive()}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};
