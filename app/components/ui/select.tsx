import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxProps,
} from '@headlessui/react';
import { ChevronDown, X } from 'lucide-react';
import { ChangeEvent, ComponentProps, ReactNode, useState } from 'react';
import { isNonNullish, isNullish } from 'remeda';

import { cn } from '@/lib/tailwind/utils';
import { getUiState } from '@/lib/ui-state';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OptionBase = { id: string; label: string; disabled?: boolean };

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder' | 'size'>;

type SelectProps<
  TValue extends OptionBase,
  TMultiple extends boolean | undefined,
> = ComboboxProps<TValue, TMultiple> &
  InputPropsRoot & {
    withClearButton?: boolean;
    options: ReadonlyArray<TValue>;
    inputProps?: RemoveFromType<InputProps, InputPropsRoot>;
    renderEmpty?: (search: string) => ReactNode;
    allowCustomValue?: boolean;
  };

export const Select = <TValue extends OptionBase>({
  withClearButton,
  inputProps,
  size,
  placeholder = 'Select...', // TODO Translation
  options,
  // createListCollectionOptions,
  // onOpenChange,
  renderEmpty,
  onChange,
  value,
  defaultValue,
  allowCustomValue = false,
  ...props
}: SelectProps<TValue, false>) => {
  const [items, setItems] = useState(options);
  const [search, setSearch] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);

    setItems(
      options.filter((item) =>
        item.label.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  const handleOnValueChange: SelectProps<TValue, false>['onChange'] = (
    value
  ) => {
    setSearch('');
    onChange?.(value);
  };

  const ui = getUiState((set) => {
    if (items.length === 0 && allowCustomValue && search.length > 0) {
      return set('create-search', { search });
    }

    if (items.length === 0 && isNullish(renderEmpty)) {
      return set('empty');
    }

    if (items.length === 0 && isNonNullish(renderEmpty)) {
      return set('empty-override', { renderEmpty });
    }

    if (items.length !== 0) {
      return set('default');
    }

    return set('default');
  });

  return (
    <Combobox
      immediate
      value={value ?? null}
      onChange={(v) => handleOnValueChange(v)}
      onClose={() => setSearch('')}
      // defaultValue={defaultValue ? [defaultValue] : undefined}
      // inputValue={options.find((o) => o.value === value)?.label}
      // inputBehavior="autohighlight"
      {...props}
    >
      <ComboboxInput
        as={Input}
        size={size}
        // TODO)) Check for the correct type here
        // @ts-expect-error Check for the correct type here
        displayValue={(item) => item?.label}
        onChange={handleInputChange}
        placeholder={placeholder}
        endElement={
          <div className="flex gap-1">
            {!!withClearButton && value && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  onChange?.(null);
                }}
              >
                <X />
              </Button>
            )}
            <ComboboxButton
              as={Button}
              variant="ghost"
              // disabled={props.disabled || props.readOnly}
              className="-me-1.5"
              size="icon-xs"
            >
              <ChevronDown />
            </ComboboxButton>
          </div>
        }
        {...inputProps}
      />

      <ComboboxOptions
        anchor="bottom"
        className="z-10 w-96 rounded-md bg-white p-1 shadow empty:invisible dark:bg-neutral-900"
      >
        {ui
          .match('empty', () => <div className="p-4">No results found</div>)
          .match('empty-override', ({ renderEmpty }) => renderEmpty(search))
          .match('create-search', ({ search }) => (
            <ComboboxOption value={{ id: search, label: search }}>
              Create <span className="font-bold">{search}</span>
            </ComboboxOption>
          ))
          .match('default', () =>
            items.map((item) => (
              <ComboboxOption
                key={item.id}
                value={item}
                disabled={item.disabled}
                className={cn(
                  'flex cursor-pointer gap-1 rounded-sm px-3 py-1.5',
                  'data-[focus]:bg-neutral-50 dark:data-[focus]:bg-neutral-800',
                  'data-[selected]:bg-neutral-100 data-[selected]:font-medium dark:data-[selected]:bg-neutral-700',
                  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                  'text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
              >
                {item.label}
              </ComboboxOption>
            ))
          )
          .exhaustive()}
      </ComboboxOptions>
    </Combobox>
  );
};
