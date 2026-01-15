import { ComponentProps } from 'react';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FieldProps } from '@/components/form/types';
import { Checkbox } from '@/components/ui/checkbox';

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
