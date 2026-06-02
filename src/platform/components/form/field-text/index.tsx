import { ComponentProps } from 'react';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import { Input } from '@/platform/components/ui/input';

export const FieldText = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & ComponentProps<typeof Input>
  >
) => {
  const { containerProps, type, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useTfField<string>();

  return (
    <FormFieldContainer {...containerProps}>
      <Input
        type={type}
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        {...rest}
        value={field.value ?? ''}
        disabled={rest.disabled}
        onChange={(e) => {
          field.onChange(e.target.value);
          rest.onChange?.(e);
        }}
        onBlur={(e) => {
          field.onBlur();
          rest.onBlur?.(e);
        }}
      />
      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
