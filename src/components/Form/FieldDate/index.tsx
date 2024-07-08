import { ReactNode } from 'react';

import { InputProps } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { DayPicker } from '@/components/DayPicker';
import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

export type FieldDateProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'date';
  label?: ReactNode;
  helper?: ReactNode;
} & Pick<InputProps, 'size' | 'autoFocus'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldDate = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldDateProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field: { ref: _ref, ...field } }) => (
        <FormFieldItem>
          {!!props.label && (
            <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
          )}
          <DayPicker
            inputProps={{ size: props.size, autoFocus: props.autoFocus }}
            {...field}
          />
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
