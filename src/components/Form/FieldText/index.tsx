import { ReactNode } from 'react';

import {
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

import { FieldCommonProps, useFormField } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';

export type InputRootProps = Pick<InputProps, 'placeholder' | 'autoFocus'>;

export type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'text' | 'email' | 'number' | 'tel';
  startElement?: ReactNode;
  endElement?: ReactNode;
  inputProps?: RemoveFromType<
    RemoveFromType<InputProps, InputRootProps>,
    ControllerRenderProps
  >;
  size?: InputGroupProps['size'];
} & InputRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldText = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldTextProps<TFieldValues, TName>
) => {
  const { size } = useFormField();

  return (
    <Controller
      {...props}
      render={({ field }) => (
        <>
          <InputGroup size={props.size ?? size}>
            <Input
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
        </>
      )}
    />
  );
};
