import { useFormField } from '@/components/new-form/form-field/context';
import { FieldLabel } from '@/components/ui/field';

export function FormFieldLabel(props: React.ComponentProps<typeof FieldLabel>) {
  const { field } = useFormField();

  return (
    <FieldLabel id={`${field.name}-label`} htmlFor={field.name} {...props} />
  );
}
