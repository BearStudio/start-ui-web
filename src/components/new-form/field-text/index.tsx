import { useFormField } from '@/components/new-form/form-field/context';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function FieldText(props: React.ComponentProps<typeof Input>) {
  const { field, fieldState, size } = useFormField();

  const descriptionId = `${field.name}-desc`;
  const errorId = `${field.name}-error`;
  return (
    <>
      <Input
        id={field.name}
        aria-invalid={fieldState.invalid}
        aria-describedby={
          !fieldState.error ? `${descriptionId}` : `${descriptionId} ${errorId}`
        }
        size={size}
        {...field}
        {...props}
        onChange={(e) => {
          field.onChange(e);
          props.onChange?.(e);
        }}
        onBlur={(e) => {
          field.onBlur();
          props.onBlur?.(e);
        }}
      />
      {fieldState.invalid && (
        <FieldError id={errorId} errors={[fieldState.error]} />
      )}
    </>
  );
}
