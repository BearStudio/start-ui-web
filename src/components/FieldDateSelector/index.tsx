import React from 'react';

import { FieldProps, useField } from '@formiz/core';

import {
  DateSelector,
  DateSelectorNextDayButton,
  DateSelectorPicker,
  DateSelectorPreviousDayButton,
} from '@/components/DateSelector';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import dayjs, { Dayjs } from 'dayjs';

export type FieldDateSelectorProps = FieldProps & FormGroupProps;

export const FieldDateSelector = (props: FieldDateSelectorProps) => {
  const { ...fieldProps } = props;
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

  function dayjsToDate(dayjsValue : Dayjs){
    setValue(dayjs(dayjsValue)) 
  }

  function dateToDayjsValue(date : Date){
    return dayjs(date); 
  }

  return (
    <FormGroup {...formGroupProps}>
      <DateSelector date={dateToDayjsValue(value)} onChange={(date : Dayjs) => dayjsToDate(date)}>
        <DateSelectorPreviousDayButton aria-label="Previous day" />
        <DateSelectorPicker />
        <DateSelectorNextDayButton aria-label="Next day" />
      </DateSelector>
      {children}
    </FormGroup>
  );
};
