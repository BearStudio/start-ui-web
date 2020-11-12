import React, { useEffect, useState } from 'react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  IconButton,
  Tooltip,
} from '@chakra-ui/core';
import { FieldProps, useField } from '@formiz/core';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Eye, EyeClosed } from 'phosphor-react';

export interface FieldInputProps extends FieldProps, FormGroupProps {
  type?: string;
  placeholder?: string;
}

export const FieldInput = (props: FieldInputProps) => {
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
  const [showPassword, setShowPassword] = useState(false);
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
          type={showPassword ? 'text' : type || 'text'}
          id={id}
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsTouched(true)}
          aria-invalid={showError}
          aria-describedby={!isValid ? `${id}-error` : null}
          placeholder={placeholder}
        />
        {type === 'password' && (
          <InputLeftElement>
            <IconButton
              onClick={() => setShowPassword((x) => !x)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              display="flex"
              size="xs"
              fontSize="lg"
              icon={
                showPassword ? (
                  <Eye weight="duotone" />
                ) : (
                  <EyeClosed weight="duotone" />
                )
              }
              variant="unstyled"
            />
          </InputLeftElement>
        )}
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
