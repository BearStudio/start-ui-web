import React, { ReactNode, useEffect, useState } from 'react';

import { Radio, RadioGroup, Wrap, WrapItem } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

interface Option {
  value: unknown;
  label?: ReactNode;
}

export interface FieldRadiosProps extends FieldProps, FormGroupProps {
  size?: 'sm' | 'md' | 'lg';
  options?: Option[];
}

export const FieldRadios = (props: FieldRadiosProps) => {
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
    helper,
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
      <RadioGroup size={size} id={id} value={value || []} onChange={setValue}>
        <Wrap spacing="4">
          {options.map((option) => (
            <WrapItem key={option.value}>
              <Radio
                id={`${id}-${option.value}`}
                name={id}
                value={option.value}
              >
                {option.label ?? option.value}
              </Radio>
            </WrapItem>
          ))}
        </Wrap>
      </RadioGroup>
      {children}
    </FormGroup>
  );
};
