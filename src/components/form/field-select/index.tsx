import type { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const FieldSelect = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
      inputProps?: React.ComponentProps<typeof SelectValue>;
    } & ComponentProps<typeof Select> &
      Pick<ComponentProps<typeof SelectValue>, 'placeholder'>
  >
) => {
  const { containerProps, inputProps, children, placeholder, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Select
        {...rest}
        disabled={field.disabled}
        value={field.value}
        onValueChange={(value, event) => {
          field.onChange(value);
          rest.onValueChange?.(value, event);
        }}
      >
        <SelectTrigger>
          <SelectValue
            {...inputProps}
            placeholder={placeholder}
            id={ctx.id}
            aria-invalid={fieldState.invalid ? true : undefined}
            aria-describedby={ctx.describedBy(fieldState.invalid)}
          />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      <FormFieldError />
    </FormFieldContainer>
  );
};
