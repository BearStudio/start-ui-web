import { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { DatePicker } from '@/components/ui/date-picker';

export type FieldDateProps = FieldProps<
  {
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
  } & ComponentProps<typeof DatePicker>
>;

export const FieldDate = (props: FieldDateProps) => {
  const { disabled, defaultValue, type, containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, displayError } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <DatePicker
        id={ctx.id}
        aria-invalid={fieldState.error ? true : undefined}
        aria-describedby={
          !fieldState.error
            ? ctx.descriptionId
            : `${ctx.descriptionId} ${ctx.errorId}`
        }
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
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
