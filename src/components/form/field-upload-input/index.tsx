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

  const getFieldUrl = (raw: unknown): string | undefined => {
    if (typeof raw !== 'string' || !raw) return undefined;
    if (raw.startsWith('http')) return raw;
    return `${envClient.VITE_S3_BUCKET_PUBLIC_URL}/${raw}`;
  };

  const value = getFieldUrl(field.value);

  return (
    <FormFieldContainer {...containerProps}>
      <UploadInput
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
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
