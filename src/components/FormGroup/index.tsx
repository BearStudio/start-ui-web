import React, { ReactNode } from 'react';
import {
  Icon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/core';
import { FiAlertTriangle } from 'react-icons/fi';

export interface FormGroupProps {
  children?: ReactNode;
  errorMessage?: ReactNode;
  helper?: ReactNode;
  id?: string;
  isRequired?: boolean;
  label?: ReactNode;
  showError?: boolean;
}

export const FormGroup = ({
  children,
  errorMessage,
  helper,
  id,
  isRequired,
  label,
  showError,
  ...props
}: FormGroupProps) => (
  <FormControl isInvalid={showError} isRequired={isRequired} {...props}>
    {!!label && <FormLabel htmlFor={id}>{label}</FormLabel>}
    {children}
    {!!helper && <FormHelperText>{helper}</FormHelperText>}
    <FormErrorMessage id={`${id}-error`}>
      <Icon as={FiAlertTriangle} mr="2" />
      {errorMessage}
    </FormErrorMessage>
  </FormControl>
);
