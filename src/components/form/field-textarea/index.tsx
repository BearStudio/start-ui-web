import { ComponentProps } from 'react';

import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { Textarea } from '@/components/ui/textarea';

import { useFormField } from '../form-field';

export type FieldTextProps = FieldProps<
  {
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
  } & ComponentProps<typeof Textarea>
>;

export const FieldTextarea = (props: FieldTextProps) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, displayError } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Textarea
        id={ctx.id}
        aria-invalid={fieldState.invalid}
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
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
