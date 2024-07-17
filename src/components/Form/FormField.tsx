import { ElementRef, createContext, useContext, useId, useMemo } from 'react';

import { FormControl, FormControlProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { match } from 'ts-pattern';

import { fixedForwardRef } from '@/lib/utils';

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

type FieldCustomProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'custom';
  optionalityHint?: 'required' | 'optional' | false;
  isDisabled?: boolean;
  displayError?: FormFieldContextValue['displayError'];
  formControlProps?: FormControlProps;
} & Omit<ControllerProps<TFieldValues, TName>, 'disabled'>;

export type FieldCommonProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FieldCustomProps<TFieldValues, TName>, 'render' | 'type'> &
  Required<Pick<FieldCustomProps<TFieldValues, TName>, 'control'>>;

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> =
  | FieldCustomProps<TFieldValues, TName>
  // -- ADD NEW FIELD PROPS TYPE HERE --
  | FieldTextProps<TFieldValues, TName>
  | FieldTextareaProps<TFieldValues, TName>
  | FieldSelectProps<TFieldValues, TName>
  | FieldMultiSelectProps<TFieldValues, TName>
  | FieldOtpProps<TFieldValues, TName>
  | FieldDateProps<TFieldValues, TName>
  | FieldCurrencyProps<TFieldValues, TName>
  | FieldPasswordProps<TFieldValues, TName>
  | FieldCheckboxesProps<TFieldValues, TName>
  | FieldRadiosProps<TFieldValues, TName>;

const FormFieldComponent = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  propsWithoutDefaults: FormFieldProps<TFieldValues, TName>,
  ref: ElementRef<typeof FormControl>
) => {
  const props = {
    displayError: true,
    ...propsWithoutDefaults,
  };

  const id = useId();

  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(props.name, formState);

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

      // -- ADD NEW FIELD COMPONENT HERE --
    }
  };

  const formControlId = match(props.type)
    .with('otp', () => `${id}-0`)
    .otherwise(() => id);

  const contextValue = useMemo(
    () => ({
      id,
      name: props.name,
      optionalityHint: props.optionalityHint,
      isDisabled: props.isDisabled,
      displayError: props.displayError,
    }),
    [
      id,
      props.name,
      props.optionalityHint,
      props.isDisabled,
      props.displayError,
    ]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <FormControl
        ref={ref}
        isInvalid={!!fieldState.error}
        display="flex"
        flexDirection="column"
        isRequired={props.optionalityHint === 'required'}
        isDisabled={props.isDisabled}
        id={formControlId}
        gap={1}
        {...props.formControlProps}
      >
        {getField()}
      </FormControl>
    </FormFieldContext.Provider>
  );
};

export const FormField = fixedForwardRef(FormFieldComponent);

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id: string;
  name: TName;
  optionalityHint?: 'required' | 'optional' | false;
  isDisabled?: boolean;
  displayError?: boolean;
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
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    ...fieldContext,
    ...fieldState,
  };
};
