import { FormFieldError } from '@/components/new-form';
import { useFormField } from '@/components/new-form/form-field';
import { FormFieldContainer } from '@/components/new-form/form-field-container';
import { useFormFieldController } from '@/components/new-form/form-field-controller/context';
import { FieldProps } from '@/components/new-form/types';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

type CheckboxOption = Omit<CheckboxProps, 'children' | 'value' | 'render'> & {
  label: string;
  value: string;
};

export type FieldCheckboxGroupProps = FieldProps<
  {
    options: Array<CheckboxOption>;
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
  } & Omit<React.ComponentProps<typeof CheckboxGroup>, 'allValues'>
>;

export const FieldCheckboxGroup = (props: FieldCheckboxGroupProps) => {
  const { containerProps, options, ...rest } = props;
  const ctx = useFormField();
  const {
    field: { value, onChange, ...field },
    fieldState,
    displayError,
  } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <CheckboxGroup
        id={ctx.id}
        aria-invalid={fieldState.invalid}
        aria-labelledby={ctx.labelId}
        aria-describedby={
          !fieldState.error
            ? `${ctx.descriptionId}`
            : `${ctx.descriptionId} ${ctx.errorId}`
        }
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
            aria-invalid={fieldState.invalid}
            size={ctx.size}
            {...field}
            {...option}
          >
            {label}
          </Checkbox>
        ))}
      </CheckboxGroup>
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
