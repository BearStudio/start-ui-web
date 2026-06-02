import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import { Checkbox, CheckboxProps } from '@/platform/components/ui/checkbox';
import { CheckboxGroup } from '@/platform/components/ui/checkbox-group';

type CheckboxOption = Omit<CheckboxProps, 'children' | 'value' | 'render'> & {
  label: string;
  value: string;
};

export const FieldCheckboxGroup = (
  props: FieldProps<
    {
      options: Array<CheckboxOption>;
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & Omit<React.ComponentProps<typeof CheckboxGroup>, 'allValues'>
  >
) => {
  const { containerProps, options, ...rest } = props;
  const ctx = useFormField();
  const { field, fieldState } = useTfField<string[]>();

  return (
    <FormFieldContainer {...containerProps}>
      <CheckboxGroup
        {...rest}
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        disabled={rest.disabled}
        value={field.value ?? []}
        onValueChange={(value, event) => {
          field.onChange(value);
          rest.onValueChange?.(value, event);
        }}
      >
        {options.map(({ label, ...option }) => (
          <Checkbox
            {...option}
            key={`${ctx.id}-${option.value}`}
            aria-invalid={fieldState.invalid ? true : undefined}
            size={ctx.size}
            disabled={rest.disabled || option.disabled}
            onBlur={field.onBlur}
          >
            {label}
          </Checkbox>
        ))}
      </CheckboxGroup>
      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
