import { ReactNode } from 'react';

import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';
import { Select, SelectProps } from '@/components/Select';

export type FieldMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'multi-select';
  label?: ReactNode;
  helper?: ReactNode;
  options: Readonly<
    Readonly<{
      label: string;
      value: PathValue<TFieldValues, TName>[number];
    }>[]
  >;
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
          props.options?.filter((option) => value?.includes(option.value)) ??
          undefined;
        return (
          <FormFieldItem>
            {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}

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
