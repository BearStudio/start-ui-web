import React, { useEffect, useState } from 'react';
import { Input, InputGroup, InputRightElement, Spinner } from '@chakra-ui/core';
import { useField } from '@formiz/core';
import { FormGroup } from '@/components/FormGroup';

export const FieldInput = (props) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    isValidating,
    resetKey,
    setValue,
    value,
  } = useField(props);
  const {
    children,
    label,
    type,
    required,
    placeholder,
    helper,
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
      <InputGroup>
        <Input
          type={type || 'text'}
          id={id}
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsTouched(true)}
          aria-invalid={showError}
          aria-describedby={!isValid ? `${id}-error` : null}
          placeholder={placeholder}
        />
        {(isTouched || isSubmitted) && isValidating && (
          <InputRightElement>
            <Spinner size="sm" flex="none" />
          </InputRightElement>
        )}
      </InputGroup>
      {children}
    </FormGroup>
  );
};
