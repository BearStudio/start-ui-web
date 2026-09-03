import { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { Textarea } from '@/components/ui/textarea';

export const FieldTextarea = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & ComponentProps<typeof Textarea>
  >
) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, isInvalid } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Textarea
        id={ctx.id}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={ctx.describedBy(isInvalid)}
        {...rest}
        value={fieldState.value ?? ''}
        onChange={(e) => {
          field.handleChange(e.target.value);
          rest.onChange?.(e);
        }}
        onBlur={(e) => {
          field.handleBlur();
          rest.onBlur?.(e);
        }}
      />

      <FormFieldError />
    </FormFieldContainer>
  );
};
