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
  const field = useField(props);
  const formGroupProps = {
    errorMessage: field.errorMessage,
    showError: field.shouldDisplayError,
  };

  if (field.shouldDisplayError) {
    return <FormGroup {...formGroupProps} {...field.otherProps} />;
  }
  return null;
};
