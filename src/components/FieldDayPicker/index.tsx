import React, { useEffect, useState } from 'react';

import { FieldProps, useField, useFormContext } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { DayPicker } from '@/components/DayPicker';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldDayPickerProps<FormattedValue = Date> = FieldProps<
  Date,
  FormattedValue
> &
  FormGroupProps & {
    invalidMessage?: string;
  };

export const FieldDayPicker = <FormattedValue = Date,>(
  props: FieldDayPickerProps<FormattedValue>
) => {
  const { t } = useTranslation(['components']);
  const { invalidMessage, ...fieldProps } = props;
  const { setErrors } = useFormContext();
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    isPristine,
    setValue,
    value,
    resetKey,
    otherProps,
  } = useField(fieldProps);
  const { children, label, placeholder, helper, ...rest } = otherProps;
  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  const handleChange = (
    date: Date | null | undefined,
    isValidDate: boolean
  ) => {
    setValue(date ?? null);
    if (!isValidDate) {
      setErrors({
        [props.name]:
          invalidMessage ?? t('components:fieldDayPicker.invalidMessage'),
      });
    }
  };

  return (
    <FormGroup {...formGroupProps}>
      <DayPicker
        id={id}
        value={value ?? ''}
        onChange={handleChange}
        onFocus={() => setIsTouched(false)}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder ? String(placeholder) : ''}
      />
      {children}
    </FormGroup>
  );
};
