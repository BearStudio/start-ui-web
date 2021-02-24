import React, { ReactNode, useEffect, useState } from 'react';

import { Select } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

interface Option {
  value: any;
  label?: ReactNode;
}

export interface FieldSelectProps extends FieldProps, FormGroupProps {
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  options?: Option[];
}

export const FieldSelect = (props: FieldSelectProps) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);
  const { required } = props;
  const {
    children,
    label,
    options = [],
    placeholder,
    helper,
    size = 'md',
    ...rest
  } = otherProps;
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
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <Select
        id={id}
        value={value || ''}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        size={size}
      >
        {(options || []).map((item) => (
          <option key={item.value} value={item.value}>
            {item.label || item.value}
          </option>
        ))}
      </Select>
      {children}
    </FormGroup>
  );
};
