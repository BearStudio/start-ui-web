import { useStore } from '@tanstack/react-form';
import { ComponentProps, ComponentRef, useRef } from 'react';

import { useFieldContext, useFormContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { FieldContextMeta } from '@/components/form/form-field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function FieldOtp(
  props: Omit<ComponentProps<typeof InputOTP>, 'children'> & {
    autoSubmit?: boolean;
    containerProps?: ComponentProps<'div'>;
  }
) {
  const { containerProps, autoSubmit, ...rest } = props;

  const containerRef = useRef<ComponentRef<'div'>>(null);
  const field = useFieldContext<string>();

  const meta = useStore(field.store, (state) => {
    const fieldMeta = state.meta as FieldContextMeta;
    return {
      id: fieldMeta.id,
      descriptionId: fieldMeta.descriptionId,
      errorId: fieldMeta.errorId,
      error: fieldMeta.errors[0],
    };
  });

  const form = useFormContext();

  return (
    <div
      {...containerProps}
      ref={containerRef}
      className={cn('flex flex-1 flex-col gap-1', containerProps?.className)}
    >
      <InputOTP
        id={meta.id}
        aria-invalid={meta.error ? true : undefined}
        aria-describedby={
          !meta.error
            ? `${meta.descriptionId}`
            : `${meta.descriptionId} ${meta.errorId}`
        }
        onComplete={(v) => {
          rest.onComplete?.(v);
          // Only auto submit on first try
          if (!form.state.isSubmitted && autoSubmit) {
            const button = document.createElement('button');
            button.type = 'submit';
            button.style.display = 'none';
            containerRef.current?.append(button);
            button.click();
            button.remove();
          }
        }}
        {...rest}
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(e);
          rest.onChange?.(e);
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
    </div>
  );
}
