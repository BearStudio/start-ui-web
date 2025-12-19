import { useFormControllerContext } from '@/components/new-form/form-controller/context';
import { FieldProps } from '@/components/new-form/types';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function FieldText({
  containerProps,
  hideErrors,
  ...rest
}: FieldProps<typeof Input>) {
  const { field, fieldState, descriptionId, errorId, size } =
    useFormControllerContext();

  return (
    <Field data-invalid={fieldState.invalid} {...containerProps}>
      <Input
        id={field.name}
        aria-invalid={fieldState.invalid}
        aria-describedby={
          !fieldState.error ? `${descriptionId}` : `${descriptionId} ${errorId}`
        }
        size={size}
        {...field}
        {...rest}
        onChange={(e) => {
          field.onChange(e);
          rest.onChange?.(e);
        }}
        onBlur={(e) => {
          field.onBlur();
          rest.onBlur?.(e);
        }}
      />
      {!hideErrors && fieldState.invalid && (
        <FieldError id={errorId} errors={[fieldState.error]} />
      )}
    </Field>
  );
}
