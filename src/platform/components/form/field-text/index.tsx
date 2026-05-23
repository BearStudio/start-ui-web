import { ComponentProps } from 'react';

import { useFormField } from '@/platform/components/form/form-field';
import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormFieldController } from '@/platform/components/form/form-field-controller/context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { Input } from '@/platform/components/ui/input';

export const FieldText = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & ComponentProps<typeof Input>
  >
) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, type } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Input
        type={type}
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
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
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
