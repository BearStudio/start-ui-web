import type { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import { UploadInput } from '@/components/upload/upload-input';

import { envClient } from '@/env/client';

export const FieldUploadInput = (
  props: FieldProps<
    {
      containerProps?: ComponentProps<typeof FormFieldContainer>;
    } & Omit<ComponentProps<typeof UploadInput>, 'defaultValue'>
  >
) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useFormFieldController();

  const value =
    field.value && !field.value.startsWith('http')
      ? `${envClient.VITE_S3_BUCKET_PUBLIC_URL}/${field.value}`
      : field.value || undefined;

  return (
    <FormFieldContainer {...containerProps}>
      <UploadInput
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        {...rest}
        disabled={field.disabled ?? rest.disabled}
        defaultValue={
          value
            ? { name: value.split('/').at(-1) ?? value, url: value }
            : undefined
        }
        onSuccess={(file) => {
          field.onChange(file.objectInfo.key);
          rest.onSuccess?.(file);
        }}
        onClear={() => {
          field.onChange(null);
          rest.onClear?.();
        }}
        onError={(error) => {
          rest.onError?.(error);
        }}
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
