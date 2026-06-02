import { useRef } from 'react';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/platform/components/ui/input-otp';

export const FieldOtp = (
  props: FieldProps<
    {
      type: 'otp';
      autoSubmit?: boolean;
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & Omit<React.ComponentProps<typeof InputOTP>, 'children'>
  >
) => {
  const { containerProps, autoSubmit, ...rest } = props;

  const containerRef = useRef<React.ComponentRef<'div'>>(null);
  const ctx = useFormField();
  const { field, fieldState, formState } = useTfField<string>();

  return (
    <FormFieldContainer {...containerProps} ref={containerRef}>
      <InputOTP
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        onComplete={(v) => {
          rest.onComplete?.(v);
          // Only auto submit on first try
          if (autoSubmit && !formState.isSubmitted) {
            const button = document.createElement('button');
            button.type = 'submit';
            button.style.display = 'none';
            containerRef.current?.append(button);
            button.click();
            button.remove();
          }
        }}
        {...rest}
        value={field.value ?? ''}
        disabled={rest.disabled}
        onChange={(value) => {
          field.onChange(value);
          rest.onChange?.(value);
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

      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
