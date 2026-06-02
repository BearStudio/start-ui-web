import { ComponentProps } from 'react';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import { DatePicker } from '@/platform/components/ui/date-picker';

export const FieldDate = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & ComponentProps<typeof DatePicker>
  >
) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useTfField<Date | null | undefined>();
  return (
    <FormFieldContainer {...containerProps}>
      <DatePicker
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        {...rest}
        value={field.value ?? undefined}
        disabled={rest.disabled}
        onChange={(value) => {
          field.onChange(value);
          rest.onChange?.(value);
        }}
        onBlur={(event) => {
          field.onBlur();
          rest.onBlur?.(event);
        }}
      />
      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
