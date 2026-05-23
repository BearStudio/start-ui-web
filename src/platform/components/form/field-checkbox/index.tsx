import { ComponentProps } from 'react';

import { useFormField } from '@/platform/components/form/form-field';
import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormFieldController } from '@/platform/components/form/form-field-controller/context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
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
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Checkbox
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        checked={value}
        onCheckedChange={onChange}
        {...rest}
        {...field}
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
