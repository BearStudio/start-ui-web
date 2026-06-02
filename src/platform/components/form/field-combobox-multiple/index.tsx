import {
  type ComponentProps,
  Fragment,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import type { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/platform/components/ui/combobox';
import { useComboboxAnchor } from '@/platform/components/ui/combobox-anchor';

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
      ComponentProps<typeof Combobox<TItem, true>>,
      'items' | 'value' | 'multiple' | 'defaultValue' | 'children'
    > & {
        items: TItem[];
        showClear?: boolean;
        children?: (item: TItem) => ReactElement;
        emptyContent?: ReactNode;
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
  const { field, fieldState } = useTfField<Array<TItem['value']>>();

  return (
    <FormFieldContainer {...containerProps}>
      <Combobox<TItem, true>
        {...rest}
        multiple
        items={items}
        disabled={rest.disabled}
        value={
          items?.filter((item) => (field.value ?? []).includes(item.value)) ??
          []
        }
        isItemEqualToValue={(item, selectedValue) =>
          item.value === selectedValue.value
        }
        itemToStringLabel={(item) => item.label?.toString() ?? ''}
        itemToStringValue={(item) => String(item.value ?? '')}
        onValueChange={(items, event) => {
          const selectedItems = items ?? [];
          const selectedValues = selectedItems.map((i) => i.value);
          field.onChange(selectedValues);
          rest.onValueChange?.(selectedValues, event);
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(items: TItem[]) => (
              <Fragment>
                {items?.map((item) => (
                  <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={ctx.id}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  aria-describedby={ctx.describedBy(fieldState.invalid)}
                  placeholder={placeholder}
                  {...inputProps}
                />
                {!!showClear && <ComboboxClear />}
              </Fragment>
            )}
          </ComboboxValue>
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
      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
