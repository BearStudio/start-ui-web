import { useFormField } from '@/components/new-form/form-field/context';
import { FieldError } from '@/components/ui/field';
import type { TValueBase } from '@/components/ui/select';
import { Select } from '@/components/ui/select';

export const FieldSelect = <TValue extends TValueBase>({
  options,
  ...rest
}: React.ComponentProps<typeof Select<TValue>>) => {
  const { field, fieldState } = useFormField();

  const descriptionId = `${field.name}-desc`;
  const errorId = `${field.name}-error`;

  return (
    <>
      <Select
        invalid={fieldState.error ? true : undefined}
        aria-invalid={fieldState.error ? true : undefined}
        aria-describedby={
          !fieldState.error ? descriptionId : `${descriptionId} ${errorId}`
        }
        {...rest}
        {...field}
        options={options}
        value={options.find((option) => option.id === field.value) ?? null}
        onChange={(e) => {
          field.onChange(e ? e.id : null);
          rest.onChange?.(e);
        }}
        inputProps={{
          id: field.name,
          onBlur: (e) => {
            field.onBlur();
            rest.inputProps?.onBlur?.(e);
          },
          ...rest.inputProps,
        }}
      />
      {fieldState.invalid && (
        <FieldError id={errorId} errors={[fieldState.error]} />
      )}
    </>
  );
};
