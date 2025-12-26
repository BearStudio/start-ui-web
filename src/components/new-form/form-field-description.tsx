import { useFormControllerContext } from '@/components/new-form/form-controller/context';
import { FieldDescription } from '@/components/ui/field';

export function FormFieldDescription(
  props: React.ComponentProps<typeof FieldDescription>
) {
  const { field } = useFormControllerContext();

  return <FieldDescription id={`${field.name}-description`} {...props} />;
}
