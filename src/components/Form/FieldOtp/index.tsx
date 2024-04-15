import { ReactNode } from 'react';

import {
  HStack,
  PinInput,
  PinInputField,
  PinInputProps,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import {
  FieldCommonProps,
  useFormField,
  useFormFieldContext,
} from '../FormField';
import { FormFieldControl } from '../FormFieldControl';
import { FormFieldError } from '../FormFieldError';
import { FormFieldHelper } from '../FormFieldHelper';
import { FormFieldItem } from '../FormFieldItem';
import { FormFieldLabel } from '../FormFieldLabel';

export type FieldOtpProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'otp';
  label?: ReactNode;
  helper?: ReactNode;
  length?: number;
} & Pick<PinInputProps, 'size' | 'autoFocus' | 'onComplete'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldOtp = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldOtpProps<TFieldValues, TName>
) => {
  const { isDisabled } = useFormFieldContext();
  return (
    <Controller
      {...props}
      render={({ field, fieldState }) => (
        <FormFieldItem>
          {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
          <FormFieldControl>
            <HStack>
              <PinInput
                autoFocus={props.autoFocus}
                size={props.size}
                onComplete={props.onComplete}
                placeholder="·"
                isInvalid={fieldState.invalid}
                isDisabled={isDisabled}
                {...field}
              >
                {Array.from({ length: props.length ?? 6 }).map((_, index) => (
                  <FormFieldControl key={index}>
                    <PinInputField flex={1} />
                  </FormFieldControl>
                ))}
              </PinInput>
            </HStack>
          </FormFieldControl>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
