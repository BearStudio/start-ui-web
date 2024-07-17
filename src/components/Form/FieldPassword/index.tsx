import { ReactNode, useState } from 'react';

import {
  Flex,
  FlexProps,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';

import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';

export type FieldPasswordProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'password';
  endElement?: ReactNode;
  inputProps?: RemoveFromType<InputProps, ControllerRenderProps>;
  containerProps?: FlexProps;
} & Pick<InputProps, 'placeholder' | 'size' | 'autoFocus'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldPassword = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldPasswordProps<TFieldValues, TName>
) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      {...props}
      render={({ field }) => (
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <InputGroup size={props.size}>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              {...props.inputProps}
              {...field}
            />
            <InputLeftElement>
              <IconButton
                isDisabled={props.isDisabled}
                onClick={() => setShowPassword((x) => !x)}
                aria-label={showPassword ? 'Hide password' : 'Show password'} // TODO: translation
                display="flex"
                size="xs"
                fontSize="lg"
                icon={showPassword ? <RiEyeLine /> : <RiEyeCloseLine />}
                variant="unstyled"
              />
            </InputLeftElement>
            {!!props.endElement && (
              <InputRightElement>{props.endElement}</InputRightElement>
            )}
          </InputGroup>
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
