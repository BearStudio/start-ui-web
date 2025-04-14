import { createContext, useMemo } from 'react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { FieldDateInput, FieldDateInputProps } from './field-date-input';
import { FieldDatePicker, FieldDatePickerProps } from './field-date-picker';
import { FieldOtp, FieldOtpProps } from './field-otp';
import { FieldSelect, FieldSelectProps } from './field-select';
import { FieldText, FieldTextProps } from './field-text';
import { useFormField } from './form-field';

type FormFieldSize = 'sm' | 'default' | 'lg';

type FieldCustomProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'custom';
} & Pick<
  ControllerProps<TFieldValues, TName>,
  'defaultValue' | 'name' | 'shouldUnregister' | 'disabled' | 'render'
> &
  Required<Pick<ControllerProps<TFieldValues, TName>, 'control'>>;

export type FieldCommonProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FieldCustomProps<TFieldValues, TName>, 'render' | 'type'> & {
  size?: FormFieldSize;
  displayError?: boolean;
};

export type FormFieldControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> =
  | FieldCustomProps<TFieldValues, TName>
  // -- ADD NEW FIELD PROPS TYPE HERE --
  | FieldSelectProps<TFieldValues, TName>
  | FieldDateInputProps<TFieldValues, TName>
  | FieldDatePickerProps<TFieldValues, TName>
  | FieldTextProps<TFieldValues, TName>
  | FieldOtpProps<TFieldValues, TName>;

export const FormFieldController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  _props: FormFieldControllerProps<TFieldValues, TName>
) => {
  const { size } = useFormField();

  const props = {
    ..._props,
    size: 'size' in _props ? (_props.size ?? size) : size,
  };

  const getField = () => {
    switch (props.type) {
      case 'custom':
        return <Controller {...props} />;

      case 'text':
      case 'email':
      case 'tel':
        return <FieldText {...props} />;

      case 'otp':
        return <FieldOtp {...props} />;

      case 'date':
        return <FieldDateInput {...props} />;

      case 'date-picker':
        return <FieldDatePicker {...props} />;

      case 'select':
        return <FieldSelect {...props} />;
      // -- ADD NEW FIELD COMPONENT HERE --
    }
  };

  const displayError = 'displayError' in props ? props.displayError : undefined;

  const contextValue: FormFieldControllerContextValue<TFieldValues, TName> =
    useMemo(
      () => ({
        name: props.name,
        control: props.control,
        displayError: displayError,
      }),
      [props.name, props.control, displayError]
    );

  return (
    <FormFieldControllerContext value={contextValue as ExplicitAny}>
      {getField()}
    </FormFieldControllerContext>
  );
};

export type FormFieldControllerContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Required<Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'>> & {
  displayError?: boolean;
};

export const FormFieldControllerContext =
  createContext<FormFieldControllerContextValue | null>(null);
