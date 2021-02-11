import React, { useEffect, useState } from 'react';

import { Select } from '@chakra-ui/react';
import { useField } from '@formiz/core';

import { FormGroup } from '@/components/FormGroup';

export const FieldSelect = (props) => {
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
        aria-invalid={showError}
        aria-describedby={!isValid ? `${id}-error` : undefined}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
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
