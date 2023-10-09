import { useEffect, useState } from 'react';

import {
  HStack,
  PinInput,
  PinInputField,
  PinInputProps,
} from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type FieldPinInputProps<FormattedValue = string> = FieldProps<
  string,
  FormattedValue
> &
  Omit<FormGroupProps, 'placeholder'> &
  Pick<PinInputProps, 'size' | 'autoFocus' | 'onComplete'>;

export const FieldPinInput = <FormattedValue = string,>(
  props: FieldPinInputProps<FormattedValue>
) => {
  const {
    errorMessage,
    id,
    isValid,
    isPristine,
    isSubmitted,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);
  const {
    label,
    helper,
    size = 'md',
    autoFocus,
    onComplete,
    ...rest
  } = otherProps;
  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);

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

  const handleOnComplete = (val: string) => {
    // onComplete provide the full value. If we call form.submit() on
    // complete, it will only take the first five values instead of all
    setValue(val);

    // Waiting for the setValue to be done.
    setTimeout(() => onComplete?.(val), 200);
  };

  return (
    <FormGroup {...formGroupProps}>
      <HStack>
        <PinInput
          size={size}
          value={value ?? ''}
          onChange={(val) => setValue(val)}
          autoFocus={autoFocus}
          onComplete={handleOnComplete}
        >
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </PinInput>
      </HStack>
    </FormGroup>
  );
};