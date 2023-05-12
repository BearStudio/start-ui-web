import React, { useEffect, useState } from 'react';

import { Checkbox } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldBooleanCheckboxProps<FormattedValue = boolean> = FieldProps<
  boolean,
  FormattedValue
> &
  FormGroupProps & {
    optionLabel?: string;
    size?: 'sm' | 'md' | 'lg';
  };

export const FieldBooleanCheckbox = <FormattedValue = boolean,>(
  props: FieldBooleanCheckboxProps<FormattedValue>
) => {
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
    helper,
    optionLabel,
    size = 'md',
    isDisabled,
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
    isDisabled,
    label,
    showError,
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <Checkbox
        id={id}
        size={size}
        isChecked={value ?? undefined}
        isDisabled={isDisabled}
        onChange={() => setValue(!value)}
      >
        {optionLabel || <>&nbsp;</>}
      </Checkbox>
      {children}
    </FormGroup>
  );
};
