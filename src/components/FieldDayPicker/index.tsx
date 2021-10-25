import React from 'react';

import { FieldProps, useField } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { FormGroup, FormGroupProps, DayPicker } from '@/components';

export interface FieldDayPickerProps extends FieldProps, FormGroupProps {
  invalidMessage?: string;
}

export const FieldDayPicker = (props: FieldDayPickerProps) => {
  const { t } = useTranslation();
  const { invalidMessage, ...fieldProps } = props;
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
    validations: [
      {
        rule: (v) => v !== null,
        message:
          invalidMessage ?? t('components:fieldDayPicker.invalidMessage'),
      },
      ...(fieldProps.validations ?? []),
    ],
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

  return (
    <FormGroup {...formGroupProps}>
      <DayPicker
        id={id}
        value={value ?? ''}
        onChange={setValue}
        placeholder={placeholder ? String(placeholder) : ''}
      />
      {children}
    </FormGroup>
  );
};
