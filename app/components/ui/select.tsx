import {
  Combobox,
  ComboboxRootProps,
  createListCollection,
} from '@ark-ui/react/combobox';
import { Portal } from '@ark-ui/react/portal';
import { ChevronDown, X } from 'lucide-react';
import { ComponentProps, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  };

export const Select = <Option extends OptionBase>({
  inputProps,
  placeholder = 'Select...', // TODO Translation
  options,
  ...props
}: SelectProps<Option>) => {
  const [items, setItems] = useState(options);

  const collection = useMemo(() => createListCollection({ items }), [items]);

  const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
    setItems(
      options.filter((item) =>
        item.label.toLowerCase().includes(details.inputValue.toLowerCase())
      )
    );
  };

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={handleInputChange}
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
          <Combobox.Content>
            <Combobox.ItemGroup>
              <Combobox.ItemGroupLabel>Frameworks</Combobox.ItemGroupLabel>
              {collection.items.map((item) => (
                <Combobox.Item key={item.value} item={item}>
                  <Combobox.ItemText>{item.label}</Combobox.ItemText>
                  <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
                </Combobox.Item>
              ))}
            </Combobox.ItemGroup>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};
