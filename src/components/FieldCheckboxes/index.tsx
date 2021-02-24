import React, { ReactNode, useEffect, useState } from 'react';

import { CheckboxGroup, Checkbox, Wrap, WrapItem } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

interface Option {
  value: any;
  label?: ReactNode;
}

export interface FieldCheckboxesProps extends FieldProps, FormGroupProps {
  size?: 'sm' | 'md' | 'lg';
  options?: Option[];
}

export const FieldCheckboxes = (props: FieldCheckboxesProps) => {
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
  const {
    children,
    label,
    options = [],
    helper,
    size = 'md',
    ...rest
  } = otherProps;
  const { required } = props;
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
      <CheckboxGroup
        size={size}
        value={value || []}
        onChange={(v) => setValue(v?.length ? v : null)}
      >
        <Wrap spacing="4">
          {options.map((option) => (
            <WrapItem key={option.value}>
              <Checkbox value={option.value} colorScheme="brand">
                {option.label ?? option.value}
              </Checkbox>
            </WrapItem>
          ))}
        </Wrap>
      </CheckboxGroup>
      {children}
    </FormGroup>
  );
};
