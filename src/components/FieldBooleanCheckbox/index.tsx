import React, { useEffect, useState } from 'react';

import { Checkbox } from '@chakra-ui/react';
import { useField, FieldProps } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export interface FieldBooleanCheckboxProps extends FieldProps, FormGroupProps {
  optionLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FieldBooleanCheckbox = (props: FieldBooleanCheckboxProps) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    resetKey,
    setValue,
    value,
  } = useField(props);
  const { required } = props;
  const {
    children,
    label,
    helper,
    optionLabel,
    size = 'md',
    ...otherProps
  } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && (isTouched || isSubmitted);

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
    ...otherProps,
  };

  return (
    <FormGroup {...formGroupProps}>
      <Checkbox
        id={id}
        size={size}
        value={value ?? false}
        onChange={() => setValue(!value)}
      >
        {optionLabel || <>&nbsp;</>}
      </Checkbox>
      {children}
    </FormGroup>
  );
};
