import { ReactNode } from 'react';

import {
  Flex,
  FlexProps,
  Input,
  InputGroup,
  InputGroupProps,
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

import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';

export type InputRootProps = Pick<InputProps, 'placeholder' | 'autoFocus'>;

export type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'text' | 'email' | 'tel';
  startElement?: ReactNode;
  endElement?: ReactNode;
  inputProps?: RemoveFromType<
    RemoveFromType<InputProps, InputRootProps>,
    ControllerRenderProps
  >;
  containerProps?: FlexProps;
  size?: InputGroupProps['size'];
} & InputRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldText = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldTextProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field, fieldState }) => (
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <InputGroup size={props.size}>
            <Input
              isInvalid={!!fieldState.error}
              isDisabled={props.isDisabled}
              type={props.type}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              {...props.inputProps}
              {...field}
            />
            {!!props.startElement && (
              <InputLeftElement>{props.startElement}</InputLeftElement>
            )}
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
