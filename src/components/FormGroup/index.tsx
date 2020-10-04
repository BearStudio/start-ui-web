import React from 'react';
import {
  Icon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/core';
import { FiAlertTriangle } from 'react-icons/fi';

export const FormGroup = ({
  children,
  errorMessage,
  helper,
  id,
  isRequired,
  label,
  showError,
  ...props
}) => (
  <FormControl mb="6" isInvalid={showError} isRequired={isRequired} {...props}>
    {!!label && <FormLabel htmlFor={id}>{label}</FormLabel>}
    {!!helper && (
      <FormHelperText mt="0" mb="3">
        {helper}
      </FormHelperText>
    )}
    {children}
    <FormErrorMessage id={`${id}-error`}>
      <Icon as={FiAlertTriangle} mr="2" />
      {errorMessage}
    </FormErrorMessage>
  </FormControl>
);
