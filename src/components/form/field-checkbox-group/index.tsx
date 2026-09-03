import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
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
  const { field, fieldState, isInvalid } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <CheckboxGroup
        id={ctx.id}
        aria-invalid={isInvalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(isInvalid)}
        {...rest}
        value={fieldState.value}
        onValueChange={(value, event) => {
          field.handleChange(value);
          rest.onValueChange?.(value, event);
        }}
      >
        {options.map(({ label, ...option }) => (
          <Checkbox
            key={`${ctx.id}-${option.value}`}
            aria-invalid={isInvalid ? true : undefined}
            size={ctx.size}
            name={field.name}
            onBlur={() => field.handleBlur()}
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
