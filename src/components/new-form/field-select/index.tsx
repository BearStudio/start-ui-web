import { useFormControllerContext } from '@/components/new-form/form-controller/context';
import { FieldProps } from '@/components/new-form/types';
import { Field, FieldError } from '@/components/ui/field';
import type { TValueBase } from '@/components/ui/select';
import { Select } from '@/components/ui/select';

export const FieldSelect = <TValue extends TValueBase>({
  options,
  containerProps,
  hideErrors,
  ...rest
}: FieldProps<typeof Select<TValue>>) => {
  const { field, fieldState, descriptionId, errorId } =
    useFormControllerContext();

  return (
    <Field data-invalid={fieldState.invalid} {...containerProps}>
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
      {!hideErrors && fieldState.invalid && (
        <FieldError id={errorId} errors={[fieldState.error]} />
      )}
    </Field>
  );
};
