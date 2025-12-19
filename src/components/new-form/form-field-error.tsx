import { useFormControllerContext } from '@/components/new-form/form-controller/context';
import { FieldError } from '@/components/ui/field';

export function FormFieldError(props: React.ComponentProps<typeof FieldError>) {
  const { field, fieldState } = useFormControllerContext();

  if (!fieldState.invalid) return;

  return (
    <FieldError
      id={`${field.name}-error`}
      errors={[fieldState.error]}
      {...props}
    />
  );
}
