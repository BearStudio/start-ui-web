import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { FormFieldControl } from '@/components/Form/FormFieldControl';
import { Select } from '@/components/Select';

import { FieldCommonProps } from '../FormField';
import { FormFieldItem } from '../FormFieldItem';

export type FieldMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'multi-select';
  options: Readonly<{
    label: string;
    value: PathValue<TFieldValues, TName>[number];
  }>[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
} & FieldCommonProps<TFieldValues, TName>;

export const FieldMultiSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldMultiSelectProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field }) => {
        const { value, onChange, ...fieldProps } = field;
        const selectValues =
          props.options?.filter((option) => value.includes(option.value)) ??
          undefined;
        return (
          <FormFieldItem label={props.label} helper={props.helper} displayError>
            <FormFieldControl>
              <Select
                type="select"
                isMulti
                size={props.size}
                options={props.options}
                placeholder={props.placeholder}
                autoFocus={props.autoFocus}
                value={selectValues}
                onChange={(options) =>
                  onChange(options.map((option) => option.value))
                }
                {...fieldProps}
              />
            </FormFieldControl>
          </FormFieldItem>
        );
      }}
    />
  );
};
