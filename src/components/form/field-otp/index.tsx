import { useStore } from '@tanstack/react-form';
import { useRef } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

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
  const { field, fieldState, isInvalid } = useFormFieldController();
  const isSubmitted = useStore(field.form.store, (state) => state.isSubmitted);
  return (
    <FormFieldContainer {...containerProps} ref={containerRef}>
      <InputOTP
        id={ctx.id}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={ctx.describedBy(isInvalid)}
        onComplete={(v) => {
          rest.onComplete?.(v);
          // Only auto submit on first try
          if (!isSubmitted && autoSubmit) {
            const button = document.createElement('button');
            button.type = 'submit';
            button.style.display = 'none';
            containerRef.current?.append(button);
            button.click();
            button.remove();
          }
        }}
        {...rest}
        name={field.name}
        value={fieldState.value ?? ''}
        onChange={(value) => {
          field.handleChange(value);
          rest.onChange?.(value);
        }}
        onBlur={(e) => {
          field.handleBlur();
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
    </FormFieldContainer>
  );
};
