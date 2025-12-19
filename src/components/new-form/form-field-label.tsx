import { useFormControllerContext } from '@/components/new-form/form-controller/context';
import { FieldLabel } from '@/components/ui/field';

export function FormFieldLabel(props: React.ComponentProps<typeof FieldLabel>) {
  const { field, labelId } = useFormControllerContext();

  return <FieldLabel id={labelId} htmlFor={field.name} {...props} />;
}
