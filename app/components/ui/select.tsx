'use client';

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption as HeadlessComboboxOption,
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
type TValueBase = OptionBase | null;

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder' | 'size'>;

type SelectProps<TValue extends TValueBase> = ComboboxProps<TValue, false> &
  InputPropsRoot & {
    /** Allow user to clear the select using a button */
    withClearButton?: boolean;
    options: ReadonlyArray<OptionBase>;
    inputProps?: RemoveFromType<InputProps, InputPropsRoot>;
    /** Override the way the empty state is displayed */
    renderEmpty?: (search: string) => ReactNode;
    /** Allow the user to provide a custom value */
    allowCustomValue?: boolean;
    renderOption?: (option: OptionBase) => ReactNode;
  };

export const Select = <TValue extends TValueBase>({
  withClearButton,
  inputProps,
  size,
  placeholder = 'Select...', // TODO Translation
  options,
  renderEmpty,
  renderOption,
  onChange,
  value,
  defaultValue,
  allowCustomValue = false,
  ...props
}: SelectProps<TValue>) => {
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

  const handleOnValueChange: SelectProps<TValue>['onChange'] = (value) => {
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

    if (items.length !== 0 && isNonNullish(renderOption)) {
      return set('render-option', { renderOption });
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
      {...props}
    >
      <div className="relative">
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
                disabled={props.disabled}
                className="-me-1.5"
                size="icon-xs"
              >
                <ChevronDown aria-hidden="true" />
              </ComboboxButton>
            </div>
          }
          {...inputProps}
        />

        <ComboboxOptions
          anchor="bottom start"
          className="absolute z-10 mt-1 w-(--input-width) overflow-auto rounded-md bg-white p-1 shadow empty:invisible dark:bg-neutral-900"
        >
          {ui
            .match('empty', () => <div className="p-4">No results found</div>)
            .match('empty-override', ({ renderEmpty }) => renderEmpty(search))
            .match('create-search', ({ search }) => (
              <ComboboxOption value={{ id: search, label: search }}>
                Create <span className="font-bold">{search}</span>
              </ComboboxOption>
            ))
            .match('render-option', ({ renderOption }) =>
              items.map((item) => renderOption(item))
            )
            .match('default', () =>
              items.map((item) => (
                <HeadlessComboboxOption
                  key={item.id}
                  value={item}
                  disabled={item.disabled}
                >
                  {item.label}
                </HeadlessComboboxOption>
              ))
            )
            .exhaustive()}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
};

export function ComboboxOption({
  ...props
}: ComponentProps<typeof HeadlessComboboxOption>) {
  return (
    <HeadlessComboboxOption
      {...props}
      className={cn(
        'flex cursor-pointer gap-1 rounded-sm px-3 py-1.5',
        'data-[focus]:bg-neutral-50 dark:data-[focus]:bg-neutral-800',
        'data-[selected]:bg-neutral-100 data-[selected]:font-medium dark:data-[selected]:bg-neutral-700',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        'text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800',
        props.className
      )}
    />
  );
}
