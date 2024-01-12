import {
  HStack,
  PinInput,
  PinInputField,
  PinInputProps,
} from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Value = PinInputProps['value'];

type UsualPinInputProps = 'autoFocus';

type FieldPinInputProps<FormattedValue = Value> = FieldProps<
  Value,
  FormattedValue
> &
  FormGroupProps &
  Pick<PinInputProps, UsualPinInputProps> & {
    length?: number;
    pinInputProps?: Omit<PinInputProps, 'children'>;
  };

export const FieldPinInput = <FormattedValue = Value,>(
  props: FieldPinInputProps<FormattedValue>
) => {
  const field = useField(props);
  const {
    pinInputProps,
    children,
    autoFocus,
    length = 6,
    ...rest
  } = field.otherProps;

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: `${field.id}-0`, // Target the first input
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
  };

  const handleOnComplete = (val: string) => {
    // onComplete provide the full value. If we call form.submit() on
    // complete, it will only take the first five values instead of all
    field.setValue(val);

    // Waiting for the setValue to be done.
    setTimeout(() => pinInputProps?.onComplete?.(val), 200);
  };

  return (
    <FormGroup {...formGroupProps}>
      <HStack>
        <PinInput
          {...pinInputProps}
          autoFocus={autoFocus}
          size={pinInputProps?.size ?? 'lg'}
          value={field.value ?? ''}
          onChange={(val) => field.setValue(val)}
          onComplete={handleOnComplete}
          placeholder="·"
          isInvalid={field.shouldDisplayError}
          id={field.id}
        >
          {Array.from({ length }, (_, index) => (
            <PinInputField key={index} flex={1} />
          ))}
        </PinInput>
      </HStack>
      {children}
    </FormGroup>
  );
};
