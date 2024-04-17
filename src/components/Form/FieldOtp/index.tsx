import { ReactNode, useId, useRef } from 'react';

import {
  HStack,
  PinInput,
  PinInputField,
  PinInputProps,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldCommonProps, useFormFieldContext } from '../FormField';
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
  autoSubmit?: boolean;
} & Pick<PinInputProps, 'size' | 'autoFocus' | 'onComplete'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldOtp = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldOtpProps<TFieldValues, TName>
) => {
  const id = useId();
  const { isDisabled } = useFormFieldContext();
  const stackRef = useRef<HTMLDivElement>(null);
  return (
    <Controller
      {...props}
      render={({ field, fieldState, formState }) => (
        <FormFieldItem
          // Target the first input
          id={`${id}-0`}
        >
          {!!props.label && (
            <FormFieldLabel htmlFor={`${id}-0`}>{props.label}</FormFieldLabel>
          )}
          <FormFieldControl>
            <HStack ref={stackRef}>
              <PinInput
                autoFocus={props.autoFocus}
                size={props.size}
                placeholder="·"
                isInvalid={fieldState.invalid}
                isDisabled={isDisabled}
                otp
                id={id}
                onComplete={(v) => {
                  props.onComplete?.(v);
                  // Only auto submit on first try
                  if (!formState.isSubmitted && props.autoSubmit) {
                    const button = document.createElement('button');
                    button.type = 'submit';
                    button.style.display = 'none';
                    stackRef.current?.append(button);
                    button.click();
                    button.remove();
                  }
                }}
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
