import React, { ReactNode, useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Select } from '@/components/Select';

interface Option {
  value: any;
  label?: ReactNode;
}

export interface FieldSelectProps extends FieldProps, FormGroupProps {
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  options?: Option[];
  noOptionsMessage?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
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
    noOptionsMessage,
    isDisabled,
    isClearable,
    isSearchable,
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
        value={options?.find((option) => option.value === value) || ''}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder || 'Select...'}
        onChange={(fieldValue) =>
          setValue(fieldValue ? fieldValue.value : null)
        }
        size={size}
        options={options}
        noOptionsMessage={noOptionsMessage || 'No option'}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isError={showError}
      />
      {children}
    </FormGroup>
  );
};
