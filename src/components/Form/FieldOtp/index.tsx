import { ElementRef, useRef } from 'react';

import {
  Flex,
  FlexProps,
  HStack,
  PinInput,
  PinInputField,
  PinInputFieldProps,
  PinInputProps,
} from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { useFormField } from '@/components/Form/FormField';
import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';

type PinInputRootProps = Pick<
  PinInputProps,
  'size' | 'autoFocus' | 'onComplete'
>;

export type FieldOtpProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'otp';
  length?: number;
  autoSubmit?: boolean;
  pinInputProps?: RemoveFromType<
    RemoveFromType<
      Omit<PinInputProps, 'isDisabled' | 'isInvalid' | 'children'>,
      PinInputRootProps
    >,
    ControllerRenderProps
  >;
  pinInputFieldProps?: PinInputFieldProps;
  containerProps?: FlexProps;
} & PinInputRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldOtp = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldOtpProps<TFieldValues, TName>
) => {
  const { id } = useFormField();
  const stackRef = useRef<ElementRef<'div'>>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);
  return (
    <Controller
      {...props}
      render={({ field: { ref: _ref, ...field }, fieldState, formState }) => (
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <HStack ref={stackRef} position="relative">
            {/* Hack because Chakra generate first input with -0 suffix  */}
            <input
              id={id}
              onFocus={() => inputRef.current?.focus()}
              tabIndex={-1}
              style={{
                opacity: 0,
                width: 0,
                height: 0,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
            {/* End of hacky zone */}
            <PinInput
              autoFocus={props.autoFocus}
              size={props.size}
              placeholder="·"
              isInvalid={fieldState.invalid}
              isDisabled={props.isDisabled}
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
              {...props.pinInputProps}
              {...field}
            >
              {Array.from({ length: props.length ?? 6 }).map((_, index) => (
                <PinInputField
                  ref={index === 0 ? inputRef : undefined}
                  flex={1}
                  key={index}
                  {...props.pinInputFieldProps}
                />
              ))}
            </PinInput>
          </HStack>
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
