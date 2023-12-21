import React, { useState } from 'react';

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

type Value = InputProps['value'];

export type FieldInputProps<FormattedValue = Value> = FieldProps<
  Value,
  FormattedValue
> &
  FormGroupProps & {
    componentProps?: InputProps;
  };

export const FieldInput = <FormattedValue = Value,>(
  props: FieldInputProps<FormattedValue>
) => {
  const field = useField(props);

  const { componentProps, children, ...rest } = field.otherProps;

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: field.id,
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormGroup {...formGroupProps}>
      <InputGroup size={componentProps?.size}>
        <Input
          type={showPassword ? 'text' : componentProps?.type ?? 'text'}
          id={field.id}
          value={field.value ?? ''}
          onChange={(e) => field.setValue(e.target.value)}
          onFocus={() => field.setIsTouched(false)}
          onBlur={() => field.setIsTouched(true)}
          placeholder={
            componentProps?.placeholder
              ? String(componentProps?.placeholder)
              : ''
          }
          autoFocus={componentProps?.autoFocus}
        />

        {componentProps?.type === 'password' && (
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

        {(field.isTouched || field.isSubmitted) && field.isValidating && (
          <InputRightElement>
            <Spinner size="sm" flex="none" />
          </InputRightElement>
        )}
      </InputGroup>
      {children}
    </FormGroup>
  );
};
