import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FieldProps } from '@/components/form/types';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

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
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <CheckboxGroup
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        value={value}
        onValueChange={(value, event) => {
          onChange?.(value);
          rest.onValueChange?.(value, event);
        }}
        {...rest}
      >
        {options.map(({ label, ...option }) => (
          <Checkbox
            key={`${ctx.id}-${option.value}`}
            aria-invalid={fieldState.invalid ? true : undefined}
            size={ctx.size}
            {...field}
            {...option}
          >
            {label}
          </Checkbox>
        ))}
      </CheckboxGroup>
      <FormFieldError />
    </FormFieldContainer>
  );
};
