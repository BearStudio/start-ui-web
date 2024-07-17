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

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import {
  FormFieldLabel,
  FormFieldLabelProps,
} from '@/components/Form/FormFieldLabel';

export type InputRootProps = Pick<InputProps, 'placeholder' | 'autoFocus'>;

export type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'text' | 'email' | 'number' | 'tel';
  label?: ReactNode;
  helper?: ReactNode;
  startElement?: ReactNode;
  endElement?: ReactNode;
  inputProps?: RemoveFromType<
    RemoveFromType<InputProps, InputRootProps>,
    ControllerRenderProps
  >;
  size?: FormFieldLabelProps['size'] & InputGroupProps['size'];
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
      render={({ field }) => (
        <FormFieldItem>
          {!!props.label && (
            <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
          )}
          <InputGroup size={props.size}>
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
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
