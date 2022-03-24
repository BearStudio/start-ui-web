import React from 'react';

import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type FieldHiddenProps = FieldProps & FormGroupProps;

export const FieldHidden: React.FC<FieldHiddenProps> = (props) => {
  const { isValid, isSubmitted, errorMessage, otherProps } = useField(props);
  const { ...rest } = otherProps as Omit<FieldHiddenProps, keyof FieldProps>;
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
