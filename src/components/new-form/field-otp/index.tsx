import { useRef } from 'react';
import { useFormState } from 'react-hook-form';

import { useFormField } from '@/components/new-form/form-field';
import { FormFieldContainer } from '@/components/new-form/form-field-container';
import { useFormFieldController } from '@/components/new-form/form-field-controller/context';
import { FormFieldError } from '@/components/new-form/form-field-error';
import { FieldProps } from '@/components/new-form/types';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export type FieldOtpProps = FieldProps<
  {
    type: 'otp';
    autoSubmit?: boolean;
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
  } & Omit<React.ComponentProps<typeof InputOTP>, 'children'>
>;

export const FieldOtp = (props: FieldOtpProps) => {
  const { containerProps, autoSubmit, ...rest } = props;

  const containerRef = useRef<React.ComponentRef<'div'>>(null);
  const ctx = useFormField();
  const formState = useFormState();
  const { field, fieldState, displayError } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps} ref={containerRef}>
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
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
