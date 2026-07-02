import {
  type ComponentProps,
  Fragment,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
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
      ComponentProps<typeof Combobox>,
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
  const { field, fieldState, isInvalid } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Combobox
        {...rest}
        multiple
        items={items}
        value={
          items?.filter((item) => fieldState.value?.includes(item.value)) ?? []
        }
        isItemEqualToValue={(item: TItem, selectedValue: TItem) =>
          item.value === selectedValue.value
        }
        itemToStringLabel={(item: TItem) => item.label?.toString() ?? ''}
        itemToStringValue={(item: TItem) => item.value}
        onValueChange={(items: TItem[], event) => {
          field.handleChange(items?.map((i) => i.value) ?? []);
          rest.onValueChange?.(items?.map((i) => i.value) ?? [], event);
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
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid ? true : undefined}
                  aria-describedby={ctx.describedBy(isInvalid)}
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
      <FormFieldError />
    </FormFieldContainer>
  );
};
