import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

type Item = {
  label: string;
  value: ExplicitAny;
  disabled?: boolean;
};

export const FieldCombobox = <TItem extends Item>(
  props: FieldProps<
    {
      containerProps?: ComponentProps<typeof FormFieldContainer>;
      inputProps?: ComponentProps<typeof ComboboxInput>;
    } & Omit<
      ComponentProps<typeof Combobox>,
      'items' | 'value' | 'multiple' | 'children'
    > & {
        items: TItem[];
        emptyContent?: ReactNode;
        children?: (item: TItem) => ReactElement;
      } & Pick<
        ComponentProps<typeof ComboboxInput>,
        'placeholder' | 'showClear'
      >
  >
) => {
  const {
    containerProps,
    inputProps,
    children,
    items,
    showClear,
    placeholder,
    emptyContent,
    ...rest
  } = props;

  const { t } = useTranslation(['components']);
  const ctx = useFormField();
  const { field, fieldState } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Combobox
        {...rest}
        items={items}
        disabled={field.disabled}
        value={items.find((item) => item.value === field.value) ?? null}
        isItemEqualToValue={(item: TItem, selectedValue: TItem) =>
          item.value === selectedValue.value
        }
        itemToStringLabel={(item: TItem) => item.label?.toString() ?? ''}
        itemToStringValue={(item: TItem) => item.value}
        onValueChange={(item: TItem, event) => {
          field.onChange(item?.value ?? null, event);
          rest.onValueChange?.(item?.value ?? null, event);
        }}
        inputRef={field.ref}
      >
        <ComboboxInput
          {...inputProps}
          disabled={field.disabled}
          onBlur={field.onBlur}
          placeholder={placeholder}
          id={ctx.id}
          aria-invalid={fieldState.invalid ? true : undefined}
          aria-describedby={ctx.describedBy(fieldState.invalid)}
          showClear={showClear}
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {emptyContent ?? t('components:combobox.noItemsFound')}
          </ComboboxEmpty>
          {children ? (
            <ComboboxList>{children}</ComboboxList>
          ) : (
            <ComboboxList>
              {(item: TItem) => (
                <ComboboxItem
                  value={item}
                  key={item.value}
                  disabled={item.disabled}
                >
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          )}
        </ComboboxContent>
      </Combobox>
      <FormFieldError />
    </FormFieldContainer>
  );
};
