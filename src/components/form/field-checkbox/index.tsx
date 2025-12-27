import { ComponentProps } from 'react';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FieldProps } from '@/components/form/types';
import { Checkbox } from '@/components/ui/checkbox';

export type FieldCheckboxProps = FieldProps<
  {
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
  } & ComponentProps<typeof Checkbox>
>;

export const FieldCheckbox = (props: FieldCheckboxProps) => {
  const { containerProps, ...rest } = props;

  const ctx = useFormField();
  const {
    field: { value, onChange, ...field },
    fieldState,
    displayError,
  } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Checkbox
        id={ctx.id}
        aria-invalid={fieldState.error ? true : undefined}
        aria-describedby={
          !fieldState.error
            ? `${ctx.descriptionId}`
            : `${ctx.descriptionId} ${ctx.errorId}`
        }
        checked={value}
        onCheckedChange={onChange}
        {...rest}
        {...field}
      />
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
