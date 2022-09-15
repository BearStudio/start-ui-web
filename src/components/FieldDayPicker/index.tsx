import React, { useEffect, useState } from 'react';

import { FieldProps, useField, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { DayPicker } from '@/components/DayPicker';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldDayPickerProps = FieldProps &
  FormGroupProps & {
    invalidMessage?: string;
  };

export const FieldDayPicker = (props: FieldDayPickerProps) => {
  const { t } = useTranslation();
  const { invalidMessage, ...fieldProps } = props;
  const { invalidateFields } = useForm({ subscribe: false });
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
  } = useField({
    debounce: 0,
    ...fieldProps,
  });
  const { children, label, placeholder, helper, size, ...rest } =
    otherProps as Omit<FieldDayPickerProps, keyof FieldProps>;
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
    setValue(date);
    if (!isValidDate) {
      invalidateFields({
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
