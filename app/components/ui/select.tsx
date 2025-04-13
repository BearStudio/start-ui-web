import {
  Combobox,
  ComboboxRootProps,
  createListCollection,
} from '@ark-ui/react/combobox';
import { Portal } from '@ark-ui/react/portal';
import { ChevronDown, X } from 'lucide-react';
import { ComponentProps, ReactNode, useMemo, useState } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isNonNullish, isNullish } from 'remeda';

type OptionBase = { value: string; label: string };

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder'>;

type SelectProps<Option extends OptionBase> = Omit<
  ComboboxRootProps<Option>,
  'collection'
> &
  InputPropsRoot & {
    options: Array<Option>;
    inputProps?: RemoveFromType<InputProps, InputPropsRoot>;
    createListCollectionOptions?: Omit<
      Parameters<typeof createListCollection<Option>>[0],
      'items'
    >;
    renderEmpty?: (search: string) => ReactNode;
  };

export const Select = <Option extends OptionBase>({
  inputProps,
  placeholder = 'Select...', // TODO Translation
  options,
  createListCollectionOptions,
  onOpenChange,
  onInputValueChange,
  renderEmpty,
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

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={handleInputChange}
      onOpenChange={handleOpenChange}
      onValueChange={console.log}
      {...props}
    >
      <Combobox.Control>
        <Combobox.Input asChild>
          <Input
            endElement={
              <div className="flex gap-1">
                <Combobox.ClearTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <X />
                  </Button>
                </Combobox.ClearTrigger>
                <Combobox.Trigger asChild>
                  <Button variant="ghost" className="-me-1.5" size="icon-xs">
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
            {collection.items.length === 0 && isNullish(renderEmpty) && (
              <div className="p-4">No results found</div> // TODO translate
            )}
            {collection.items.length === 0 &&
              isNonNullish(renderEmpty) &&
              renderEmpty(search)}
            {collection.items.length !== 0 && (
              <Combobox.ItemGroup>
                {collection.items.slice(0, 20).map((item) => (
                  <Combobox.Item
                    key={item.value}
                    item={item}
                    className={cn(
                      'flex cursor-pointer gap-1 rounded-sm px-2 py-0.5 data-[disabled]:opacity-50',
                      'data-[highlighted]:bg-neutral-50 dark:data-[highlighted]:bg-neutral-800',
                      'data-[state=checked]:bg-neutral-100 dark:data-[state=checked]:bg-neutral-700',
                      'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Combobox.ItemText>{item.label}</Combobox.ItemText>
                  </Combobox.Item>
                ))}
              </Combobox.ItemGroup>
            )}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};
