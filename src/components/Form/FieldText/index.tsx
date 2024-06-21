import { ReactNode } from 'react';

import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

export type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'text' | 'email' | 'number' | 'tel';
  label?: ReactNode;
  helper?: ReactNode;
  startElement?: ReactNode;
  endElement?: ReactNode;
} & Pick<InputProps, 'placeholder' | 'autoFocus'> &
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
          {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
          <Flex direction="column" flex={1} gap={1.5}>
            <InputGroup size={props.size} flex={1}>
              <Input
                type={props.type}
                placeholder={props.placeholder}
                autoFocus={props.autoFocus}
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

          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
        </FormFieldItem>
      )}
    />
  );
};
