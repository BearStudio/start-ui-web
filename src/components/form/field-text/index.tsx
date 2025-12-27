import { ComponentProps } from 'react';

import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { Input } from '@/components/ui/input';

import { useFormField } from '../form-field';

export type FieldTextProps = FieldProps<
  {
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
  } & ComponentProps<typeof Input>
>;

export const FieldText = (props: FieldTextProps) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, displayError, type } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Input
        type={type}
        id={ctx.id}
        aria-invalid={fieldState.invalid}
        aria-describedby={
          !fieldState.error
            ? `${ctx.descriptionId}`
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
