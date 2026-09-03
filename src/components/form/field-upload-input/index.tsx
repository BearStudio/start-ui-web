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
  const { field, fieldState, isInvalid } = useFormFieldController();

  const getFieldUrl = (raw: unknown): string | undefined => {
    if (typeof raw !== 'string' || !raw) return undefined;
    if (raw.startsWith('http')) return raw;
    return `${envClient.VITE_S3_BUCKET_PUBLIC_URL}/${raw}`;
  };

  const value = getFieldUrl(fieldState.value);

  return (
    <FormFieldContainer {...containerProps}>
      <UploadInput
        {...rest}
        defaultValue={
          value
            ? { name: value.split('/').at(-1) ?? value, url: value }
            : undefined
        }
        onSuccess={(file) => {
          field.handleChange(file.objectInfo.key);
          rest.onSuccess?.(file);
        }}
        onClear={() => {
          field.handleChange(null);
          rest.onClear?.();
        }}
        onError={(error) => {
          rest.onError?.(error);
        }}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={ctx.describedBy(isInvalid)}
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
