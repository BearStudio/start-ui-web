import { ComponentProps } from 'react';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import { Checkbox } from '@/platform/components/ui/checkbox';

export const FieldCheckbox = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & ComponentProps<typeof Checkbox>
  >
) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useTfField<boolean>();

  return (
    <FormFieldContainer {...containerProps}>
      <Checkbox
        {...rest}
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        checked={field.value ?? false}
        disabled={rest.disabled}
        onCheckedChange={(checked, event) => {
          field.onChange(Boolean(checked));
          rest.onCheckedChange?.(checked, event);
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
