import React, { useState } from 'react';

import { FieldProps, useField, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import {
  DateSelector,
  DateSelectorNextDayButton,
  DateSelectorPicker,
  DateSelectorPreviousDayButton,
} from '@/components/DateSelector';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldDateSelectorProps = FieldProps &
  FormGroupProps & {
    invalidMessage?: string;
  };

export const FieldDateSelector = (props: FieldDateSelectorProps) => {
  const { invalidMessage, ...fieldProps } = props;
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    isPristine,
    setValue,
    value,
    otherProps,
  } = useField({
    debounce: 0,
    ...fieldProps,
  });
  const { children, label, placeholder, helper, size, ...rest } =
    otherProps as Omit<FieldDateSelectorProps, keyof FieldProps>;
  const { required } = props;
  const showError = !isValid && (!isPristine || isSubmitted);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <DateSelector date={value} onChange={setValue}>
        <DateSelectorPreviousDayButton aria-label="Previous day" />
        <DateSelectorPicker />
        <DateSelectorNextDayButton aria-label="Next day" />
      </DateSelector>
      {children}
    </FormGroup>
  );
};
