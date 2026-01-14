import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { Select } from '@/components/ui/select';

export const FieldSelect = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & React.ComponentProps<typeof Select>
  >
) => {
  const { containerProps, options, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, displayError } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Select
        invalid={fieldState.invalid}
        aria-invalid={fieldState.invalid}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        {...rest}
        {...field}
        options={options}
        value={options.find((option) => option.id === field.value) ?? null}
        onChange={(e) => {
          field.onChange(e ? e.id : null);
          rest.onChange?.(e);
        }}
        inputProps={{
          id: ctx.id,
          onBlur: (e) => {
            field.onBlur();
            rest.inputProps?.onBlur?.(e);
          },
          ...rest.inputProps,
        }}
      />
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
