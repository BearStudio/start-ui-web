import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/core';

const propTypes = {
  children: PropTypes.node,
  errorMessage: PropTypes.node,
  helper: PropTypes.node,
  id: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  label: PropTypes.node,
  showError: PropTypes.bool,
};
const defaultProps = {
  children: '',
  errorMessage: '',
  helper: '',
  isRequired: false,
  label: '',
  showError: false,
};

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
  <FormControl
    isInvalid={showError}
    isRequired={isRequired}
    {...props}
  >
    {!!label && (
      <FormLabel htmlFor={id}>
        {label}
      </FormLabel>
    )}
    {!!helper && (
      <FormHelperText mt="0" mb="3">
        {helper}
      </FormHelperText>
    )}
    {children}
    <FormErrorMessage id={`${id}-error`}>
      { errorMessage }
    </FormErrorMessage>
  </FormControl>
);

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;
