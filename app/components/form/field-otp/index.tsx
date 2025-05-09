import { ComponentProps, ComponentRef, useRef } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { useFormField } from '../form-field';
import { FieldProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

export type FieldOtpProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'otp';
    autoSubmit?: boolean;
    containerProps?: ComponentProps<'div'>;
  } & Omit<ComponentProps<typeof InputOTP>, 'children'>
>;

export const FieldOtp = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldOtpProps<TFieldValues, TName>
) => {
  const {
    name,
    type,
    disabled,
    defaultValue,
    shouldUnregister,
    control,
    containerProps,
    autoSubmit,
    ...rest
  } = props;

  const containerRef = useRef<ComponentRef<'div'>>(null);
  const ctx = useFormField();
  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState, formState }) => (
        <div
          {...containerProps}
          ref={containerRef}
          className={cn(
            'flex flex-1 flex-col gap-1',
            containerProps?.className
          )}
        >
          <InputOTP
            id={ctx.id}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={
              !fieldState.error
                ? `${ctx.descriptionId}`
                : `${ctx.descriptionId} ${ctx.errorId}`
            }
            onComplete={(v) => {
              rest.onComplete?.(v);
              // Only auto submit on first try
              if (!formState.isSubmitted && autoSubmit) {
                const button = document.createElement('button');
                button.type = 'submit';
                button.style.display = 'none';
                containerRef.current?.append(button);
                button.click();
                button.remove();
              }
            }}
            {...rest}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              rest.onChange?.(e);
            }}
            onBlur={(e) => {
              field.onBlur();
              rest.onBlur?.(e);
            }}
          >
            <InputOTPGroup>
              {Array.from({ length: rest.maxLength }).map((_, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key
                <InputOTPSlot index={index} key={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FormFieldError />
        </div>
      )}
    />
  );
};
