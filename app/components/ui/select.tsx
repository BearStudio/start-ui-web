'use client';

import { getUiState } from '@bearstudio/ui-state';
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
import { useTranslation } from 'react-i18next';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OptionBase = { id: string; label: string; disabled?: boolean };
type TValueBase = OptionBase | null;

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<
  InputProps,
  | 'placeholder'
  | 'size'
  | 'aria-invalid'
  | 'aria-describedby'
  | 'readOnly'
  | 'autoFocus'
>;

type SelectProps<TValue extends TValueBase> = ComboboxProps<TValue, false> &
  InputPropsRoot & {
    /** Allow user to clear the select using a button */
    withClearButton?: boolean;
    options: ReadonlyArray<NonNullable<TValue>>;
    inputProps?: Omit<
      RemoveFromType<InputProps, InputPropsRoot>,
      // Removing the defaultValue from the input to avoid conflict with ComboboxInput type
      'defaultValue'
    >;
    /** Override the way the empty state is displayed */
    renderEmpty?: (search: string) => ReactNode;
    /** Allow the user to provide a custom value */
    allowCustomValue?: boolean;
    /** Allow you to provide custom ComboboxOption */
    renderOption?: (option: NonNullable<TValue>) => ReactNode;
    mode?: 'default' | 'virtual';
  };

export const Select = <TValue extends TValueBase>({
  withClearButton,
  inputProps,
  size,
  placeholder,
  options,
  renderEmpty,
  renderOption,
  onChange,
  value,
  autoFocus,
  allowCustomValue = false,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  readOnly,
  mode = 'default',
  ...props
}: SelectProps<TValue>) => {
  const { t } = useTranslation(['components']);
  const [search, setSearch] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleOnValueChange: SelectProps<TValue>['onChange'] = (value) => {
    setSearch('');
    onChange?.(value);
  };

  /**
   * On close, reset the search and items so they are back to the original state
   */
  const handleOnClose = () => {
    setSearch('');
  };

  const items = options.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

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

    if (mode === 'virtual' && !isEmpty(items)) {
      return set('virtual');
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
      onClose={handleOnClose}
      virtual={
        mode === 'virtual' && isNonNullish(items) && !isEmpty(items)
          ? { options: items, disabled: (o) => o?.disabled ?? false }
          : undefined
      }
      disabled={props.disabled || readOnly}
      {...props}
    >
      <div className="relative">
        {/* Setting the type so we have type check and typings for the displayValue prop */}
        <ComboboxInput<TValue, typeof Input>
          as={Input}
          size={size}
          displayValue={(item) => item?.label ?? ''}
          onChange={handleInputChange}
          autoFocus={autoFocus}
          placeholder={placeholder ?? t('components:select.placeholder')}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
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
            .match('empty', () => (
              <div className="p-4">{t('components:select.noResultsFound')}</div>
            ))
            .match('empty-override', ({ renderEmpty }) => renderEmpty(search))
            .match('create-search', ({ search }) => (
              <ComboboxOption value={{ id: search, label: search }}>
                {t('components:select.create', { searchTerm: search })}
              </ComboboxOption>
            ))
            .match('virtual', () => ({ option }: { option: OptionBase }) => (
              <ComboboxOption value={option}>{option.label}</ComboboxOption>
            ))
            .match('render-option', ({ renderOption }) =>
              items.map((item) => renderOption(item))
            )
            .match('default', () =>
              items.map((item) => (
                <ComboboxOption
                  key={item.id}
                  value={item}
                  disabled={item.disabled}
                >
                  {item.label}
                </ComboboxOption>
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
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800',
        props.className
      )}
    />
  );
}
