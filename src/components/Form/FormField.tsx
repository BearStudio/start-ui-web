import { createContext, useContext, useMemo } from 'react';

import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';

import { FieldCheckboxes, FieldCheckboxesProps } from './FieldCheckboxes';
import { FieldCurrency, FieldCurrencyProps } from './FieldCurrency';
import { FieldDate, FieldDateProps } from './FieldDate';
import { FieldMultiSelect, FieldMultiSelectProps } from './FieldMultiSelect';
import { FieldOtp, FieldOtpProps } from './FieldOtp';
import { FieldPassword, FieldPasswordProps } from './FieldPassword';
import { FieldRadios, FieldRadiosProps } from './FieldRadios';
import { FieldSelect, FieldSelectProps } from './FieldSelect';
import { FieldText, FieldTextProps } from './FieldText';
import { FieldTextarea, FieldTextareaProps } from './FieldTextarea';
import { FieldUpload, FieldUploadProps } from './FieldUpload';
import { useFormFieldItemContext } from './FormFieldItem';

type FieldCustomProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'custom';
  optionalityHint?: 'required' | 'optional' | false;
  isDisabled?: boolean;
} & Omit<ControllerProps<TFieldValues, TName>, 'disabled'>;

export type FieldCommonProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FieldCustomProps<TFieldValues, TName>, 'render' | 'type'>;

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props:
    | FieldCustomProps<TFieldValues, TName>
    | FieldTextProps<TFieldValues, TName>
    | FieldTextareaProps<TFieldValues, TName>
    | FieldSelectProps<TFieldValues, TName>
    | FieldMultiSelectProps<TFieldValues, TName>
    | FieldOtpProps<TFieldValues, TName>
    | FieldDateProps<TFieldValues, TName>
    | FieldCurrencyProps<TFieldValues, TName>
    | FieldPasswordProps<TFieldValues, TName>
    | FieldCheckboxesProps<TFieldValues, TName>
    | FieldRadiosProps<TFieldValues, TName>
    | FieldUploadProps<TFieldValues, TName>
  // -- ADD NEW FIELD PROPS TYPE HERE --
) => {
  const getField = () => {
    switch (props.type) {
      case 'custom':
        return <Controller {...props} />;

      case 'text':
      case 'email':
      case 'number':
      case 'tel':
        return <FieldText {...props} />;

      case 'password':
        return <FieldPassword {...props} />;

      case 'currency':
        return <FieldCurrency {...props} />;

      case 'textarea':
        return <FieldTextarea {...props} />;

      case 'otp':
        return <FieldOtp {...props} />;

      case 'select':
        return <FieldSelect {...props} />;

      case 'multi-select':
        return <FieldMultiSelect {...props} />;

      case 'date':
        return <FieldDate {...props} />;

      case 'checkboxes':
        return <FieldCheckboxes {...props} />;

      case 'radios':
        return <FieldRadios {...props} />;

      case 'upload':
        return <FieldUpload {...props} />;
      // -- ADD NEW FIELD COMPONENT HERE --
    }
  };

  const contextValue = useMemo(
    () => ({
      name: props.name,
      optionalityHint: props.optionalityHint,
      isDisabled: props.isDisabled,
    }),
    [props.name, props.optionalityHint, props.isDisabled]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      {getField()}
    </FormFieldContext.Provider>
  );
};

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  optionalityHint?: 'required' | 'optional' | false;
  isDisabled?: boolean;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null
);

export const useFormFieldContext = () => {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error('Missing <FormField /> parent component');
  }
  return ctx;
};

export const useFormField = () => {
  const fieldContext = useFormFieldContext();
  const itemContext = useFormFieldItemContext();
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    ...fieldContext,
    ...fieldState,
  };
};
