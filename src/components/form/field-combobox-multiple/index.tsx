import { type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import {
  Combobox,
  type ComboboxChangeEventDetails,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  type ComboboxProps,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

type Item = {
  label: string;
  value: ExplicitAny;
  disabled?: boolean;
};

export const FieldComboboxMultiple = <TItem extends Item>(
  props: FieldProps<
    {
      containerProps?: ComponentProps<typeof FormFieldContainer>;
      inputProps?: ComponentProps<typeof ComboboxChipsInput>;
    } & Omit<
      ComboboxProps<TItem['value'], true>,
      | 'items'
      | 'value'
      | 'multiple'
      | 'defaultValue'
      | 'children'
      | 'onValueChange'
    > & {
        items: TItem[];
        showClear?: boolean;
        children?: (item: TItem) => ReactElement;
        emptyContent?: ReactNode;
        onValueChange?: (
          value: Array<TItem['value']>,
          eventDetails: ComboboxChangeEventDetails
        ) => void;
      } & Pick<ComponentProps<typeof ComboboxChipsInput>, 'placeholder'>
  >
) => {
  const anchor = useComboboxAnchor();
  const {
    containerProps,
    inputProps,
    items,
    children,
    showClear = true,
    placeholder,
    emptyContent,
    ...rest
  } = props;

  const { t } = useTranslation(['components']);
  const ctx = useFormField();
  const { field, fieldState } = useFormFieldController();
  const { ref: setControlElement } = field;

  return (
    <FormFieldContainer {...containerProps}>
      <Combobox
        {...rest}
        multiple
        items={items}
        name={field.name}
        disabled={field.disabled}
        value={field.value ?? []}
        onValueChange={(values, event) => {
          field.onChange(values, event);
          rest.onValueChange?.(values, event);
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: Array<TItem['value']>, { labels }) =>
              values.map((value, index) => (
                <ComboboxChip key={value} value={value}>
                  {labels[index]}
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput
            ref={setControlElement}
            id={ctx.id}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid ? true : undefined}
            aria-describedby={ctx.describedBy(fieldState.invalid)}
            placeholder={placeholder}
            {...inputProps}
          />
          {!!showClear && <ComboboxClear />}
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>
            {emptyContent ?? t('components:combobox.noItemsFound')}
          </ComboboxEmpty>

          {children ? (
            <ComboboxList>{children}</ComboboxList>
          ) : (
            <ComboboxList>
              {(item: TItem) => (
                <ComboboxItem
                  value={item.value}
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
