import React from 'react';

import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type FieldHiddenProps<FormattedValue = unknown> = FieldProps<
  unknown,
  FormattedValue
> &
  FormGroupProps;

export const FieldHidden = <FormattedValue = unknown,>(
  props: FieldHiddenProps<FormattedValue>
) => {
  const { isValid, isSubmitted, errorMessage, otherProps } = useField(props);
  const { ...rest } = otherProps;
  const showError = !isValid && isSubmitted;
  const formGroupProps = {
    errorMessage,
    showError,
  };

  if (showError) {
    return <FormGroup {...formGroupProps} {...rest} />;
  }
  return null;
};
