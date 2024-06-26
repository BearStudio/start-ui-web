import React from 'react';

import {
  HStack,
  IconButton,
  IconButtonProps,
  Input,
  InputGroup,
  InputRightElement,
  StackProps,
  useNumberInput,
} from '@chakra-ui/react';
import { FiMinus, FiPlus } from 'react-icons/fi';

type NumericStepperInputProps = StackProps & {
  isDisabled?: boolean;
  rightElement: string;
  buttonProps?: IconButtonProps;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  variant?: string;
  onChange?: (value: number) => unknown;
};

export const NumericStepperInput = (props: NumericStepperInputProps) => {
  const {
    rightElement,
    buttonProps,
    isDisabled,
    min,
    max,
    step,
    defaultValue,
    value: valueFromProps,
    onChange,
    variant,
    ...rest
  } = props;

  const {
    getInputProps: getDefaultInputProps,
    getIncrementButtonProps: getDefaultIncrementButtonProps,
    getDecrementButtonProps: getDefaultDecrementButtonProps,
  } = useNumberInput({
    isDisabled,
    min,
    max,
    step,
    defaultValue,
    value: valueFromProps,
    onChange: (_, newValue) => {
      onChange?.(newValue);
    },
  });

  const inputProps = getDefaultInputProps({
    isReadOnly: true,
  });
  const incrementButtonProps = getDefaultIncrementButtonProps();
  const decrementButtonProps = getDefaultDecrementButtonProps();

  return (
    <HStack {...rest} width="12em">
      <IconButton
        aria-label="minus"
        icon={<FiMinus />}
        color="brand.700"
        variant={variant}
        {...decrementButtonProps}
        {...buttonProps}
      />
      <InputGroup>
        <Input {...inputProps} />
        {rightElement && (
          <InputRightElement color="gray.400">{rightElement}</InputRightElement>
        )}
      </InputGroup>
      <IconButton
        aria-label="plus"
        icon={<FiPlus />}
        color="brand.700"
        variant={variant}
        {...incrementButtonProps}
        {...buttonProps}
      />
    </HStack>
  );
};
