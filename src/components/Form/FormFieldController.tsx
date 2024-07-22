import { createContext, useMemo } from 'react';

import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { useFormField } from '@/components/Form/FormField';

import { FieldCheckbox, FieldCheckboxProps } from './FieldCheckbox';
import { FieldCheckboxes, FieldCheckboxesProps } from './FieldCheckboxes';
import { FieldCurrency, FieldCurrencyProps } from './FieldCurrency';
import { FieldDate, FieldDateProps } from './FieldDate';
import { FieldMultiSelect, FieldMultiSelectProps } from './FieldMultiSelect';
import { FieldOtp, FieldOtpProps } from './FieldOtp';
import { FieldPassword, FieldPasswordProps } from './FieldPassword';
import { FieldRadios, FieldRadiosProps } from './FieldRadios';
import { FieldSelect, FieldSelectProps } from './FieldSelect';
import { FieldSwitch, FieldSwitchProps } from './FieldSwitch';
import { FieldText, FieldTextProps } from './FieldText';
import { FieldTextarea, FieldTextareaProps } from './FieldTextarea';

type FormFieldSize = 'sm' | 'md' | 'lg';

type FieldCustomProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'custom';
} & Omit<ControllerProps<TFieldValues, TName>, 'disabled'> &
  Required<Pick<ControllerProps<TFieldValues, TName>, 'control'>>;

export type FieldCommonProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FieldCustomProps<TFieldValues, TName>, 'render' | 'type'> & {
  size?: FormFieldSize;
  displayError?: boolean;
  isDisabled?: boolean;
};

export type FormFieldControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> =
  | FieldCustomProps<TFieldValues, TName>
  // -- ADD NEW FIELD PROPS TYPE HERE --
  | FieldCheckboxProps<TFieldValues, TName>
  | FieldSwitchProps<TFieldValues, TName>
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

export const FormFieldController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  _props: FormFieldControllerProps<TFieldValues, TName>
) => {
  const { size } = useFormField();

  const props = {
    ..._props,
    size: 'size' in _props ? _props.size ?? size : size,
  };

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

      case 'checkbox':
        return <FieldCheckbox {...props} />;

      case 'switch':
        return <FieldSwitch {...props} />;

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
    <FormFieldControllerContext.Provider value={contextValue as ExplicitAny}>
      {getField()}
    </FormFieldControllerContext.Provider>
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
