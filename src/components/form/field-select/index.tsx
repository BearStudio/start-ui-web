import { ComponentProps } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import { Select } from '@/components/ui/select';

export type FieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'select';
    containerProps?: ComponentProps<'div'>;
  } & ComponentProps<typeof Select>
>;

export const FieldSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldSelectProps<TFieldValues, TName>
) => {
  const {
    name,
    control,
    disabled,
    defaultValue,
    shouldUnregister,
    type,
    containerProps,
    options,
    ...rest
  } = props;

  const ctx = useFormField();

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        return (
          <div
            {...containerProps}
            className={cn(
              'flex flex-1 flex-col gap-1',
              containerProps?.className
            )}
          >
            <Select
              invalid={fieldState.error ? true : undefined}
              aria-invalid={fieldState.error ? true : undefined}
              aria-describedby={
                !fieldState.error
                  ? ctx.descriptionId
                  : `${ctx.descriptionId} ${ctx.errorId}`
              }
              {...rest}
              {...field}
              options={options}
              value={
                options.find((option) => option.id === field.value) ?? null
              }
              onChange={(e) => {
                field.onChange(e ? e.id : null);
                rest.onChange?.(e);
              }}
              inputProps={{
                id: ctx.id,
                onBlur: (e) => {
                  field.onBlur();
                  rest.inputProps?.onBlur?.(e);
                },
                ...rest.inputProps,
              }}
            />
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};
