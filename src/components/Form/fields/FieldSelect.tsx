import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { FormFieldControl } from '@/components/Form/FormFieldControl';
import { Select } from '@/components/Select';

import { FieldCommonProps } from '../FormField';
import { FormFieldItem } from '../FormFieldItem';

export type FieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'select';
  options: Readonly<{
    label: string;
    value: PathValue<TFieldValues, TName>;
  }>[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
} & FieldCommonProps<TFieldValues, TName>;

export const FieldSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldSelectProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field }) => {
        const { value, onChange, ...fieldProps } = field;
        const selectValue =
          props.options?.find((option) => option.value === value) ?? undefined;
        return (
          <FormFieldItem label={props.label} helper={props.helper} displayError>
            <FormFieldControl>
              <Select
                type="select"
                size={props.size}
                options={props.options}
                placeholder={props.placeholder}
                autoFocus={props.autoFocus}
                value={selectValue}
                onChange={(option) => onChange(option?.value)}
                {...fieldProps}
              />
            </FormFieldControl>
          </FormFieldItem>
        );
      }}
    />
  );
};
