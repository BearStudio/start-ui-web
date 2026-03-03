import type { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import {
  UploadInput,
  type UploadInputDefaultValue,
} from '@/components/upload/upload-input';

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

  const defaultValue = field.value as UploadInputDefaultValue | undefined;

  return (
    <FormFieldContainer {...containerProps}>
      <UploadInput
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        {...rest}
        disabled={field.disabled ?? rest.disabled}
        defaultValue={defaultValue}
        onSuccess={(file) => {
          field.onChange({
            name: file.name,
            url: file.objectInfo.key,
          } satisfies UploadInputDefaultValue);
          rest.onSuccess?.(file);
        }}
        onError={(error) => {
          rest.onError?.(error);
        }}
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
