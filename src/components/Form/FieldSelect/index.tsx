import { ReactNode } from 'react';

import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { Select, SelectProps } from '@/components/Select';

import { FieldCommonProps } from '../FormField';
import { FormFieldError } from '../FormFieldError';
import { FormFieldHelper } from '../FormFieldHelper';
import { FormFieldItem } from '../FormFieldItem';
import { FormFieldLabel } from '../FormFieldLabel';

export type FieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'select';
  label?: ReactNode;
  helper?: ReactNode;
  options: Readonly<
    Readonly<{
      label: string;
      value: PathValue<TFieldValues, TName>;
    }>[]
  >;
} & Pick<SelectProps, 'size' | 'placeholder' | 'autoFocus'> &
  FieldCommonProps<TFieldValues, TName>;

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
          <FormFieldItem>
            {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
            <Select
              type="select"
              size={props.size}
              options={props.options}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              value={selectValue}
              onChange={(option) => onChange(option?.value)}
              menuPortalTarget={document.body}
              {...fieldProps}
            />

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
