import { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { DatePicker } from '@/components/ui/date-picker';

export const FieldDate = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & ComponentProps<typeof DatePicker>
  >
) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, isInvalid } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <DatePicker
        id={ctx.id}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={ctx.describedBy(isInvalid)}
        {...rest}
        name={field.name}
        value={fieldState.value ?? null}
        onChange={(date) => {
          field.handleChange(date);
          rest.onChange?.(date);
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
