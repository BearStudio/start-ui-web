import { ReactNode } from 'react';

import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { Select, SelectProps } from '@/components/Select';

import { FieldCommonProps } from '../FormField';
import { FormFieldControl } from '../FormFieldControl';
import { FormFieldError } from '../FormFieldError';
import { FormFieldHelper } from '../FormFieldHelper';
import { FormFieldItem } from '../FormFieldItem';
import { FormFieldLabel } from '../FormFieldLabel';

export type FieldMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'multi-select';
  label?: ReactNode;
  helper?: ReactNode;
  options: Readonly<{
    label: string;
    value: PathValue<TFieldValues, TName>[number];
  }>[];
} & Pick<SelectProps, 'size' | 'placeholder' | 'autoFocus'> &
  FieldCommonProps<TFieldValues, TName>;

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
          <FormFieldItem>
            {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
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
            {!!props.helper && (
              <FormFieldHelper>{props.helper}</FormFieldHelper>
            )}
            <FormFieldError />
          </FormFieldItem>
        );
      }}
    />
  );
};
