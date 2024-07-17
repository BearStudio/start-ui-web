import { ReactNode } from 'react';

import { InputProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import {
  DayPicker,
  DayPickerInputProps,
  DayPickerProps,
} from '@/components/DayPicker';
import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

type DayPickerInputRootProps = Pick<
  InputProps,
  'size' | 'autoFocus' | 'placeholder'
>;

export type FieldDateProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'date';
  label?: ReactNode;
  helper?: ReactNode;
  dayPickerProps?: RemoveFromType<DayPickerProps, ControllerRenderProps>;
  dayPickerInputProps?: RemoveFromType<
    DayPickerInputProps,
    DayPickerInputRootProps
  >;
} & DayPickerInputRootProps &
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
            placeholder={props.placeholder}
            inputProps={{
              size: props.size,
              autoFocus: props.autoFocus,
              ...props.dayPickerInputProps,
            }}
            {...props.dayPickerProps}
            {...field}
          />
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
