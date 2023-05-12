import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldInputProps<FormattedValue = string> = FieldProps<
  string,
  FormattedValue
> &
  Omit<FormGroupProps, 'placeholder'> &
  Pick<InputProps, 'type' | 'placeholder'> & {
    size?: 'sm' | 'md' | 'lg';
    autoFocus?: boolean;
  };

export const FieldInput = <FormattedValue = string,>(
  props: FieldInputProps<FormattedValue>
) => {
  const {
    errorMessage,
    id,
    isValid,
    isPristine,
    isSubmitted,
    isValidating,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);
  const {
    children,
    label,
    type,
    placeholder,
    helper,
    size = 'md',
    autoFocus,
    ...rest
  } = otherProps;
  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

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
      <InputGroup size={size}>
        <Input
          type={showPassword ? 'text' : type || 'text'}
          id={id}
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsTouched(false)}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder ? String(placeholder) : ''}
          autoFocus={autoFocus}
        />

        {type === 'password' && (
          <InputLeftElement>
            <IconButton
              onClick={() => setShowPassword((x) => !x)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              display="flex"
              size="xs"
              fontSize="lg"
              icon={showPassword ? <RiEyeLine /> : <RiEyeCloseLine />}
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
