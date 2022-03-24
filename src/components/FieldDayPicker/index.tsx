import React from 'react';

import { FieldProps, useField, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { DayPicker, FormGroup, FormGroupProps } from '@/components';

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
    setValue,
    value,
    otherProps,
  } = useField({
    debounce: 0,
    ...fieldProps,
  });
  const { children, label, type, placeholder, helper, size, ...rest } =
    otherProps;
  const { required } = props;
  const showError = !isValid && isSubmitted;

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
        placeholder={placeholder ? String(placeholder) : ''}
      />
      {children}
    </FormGroup>
  );
};
