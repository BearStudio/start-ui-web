import { ComponentProps } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { Input } from '@/components/ui/input';

import { useFormField } from '../form-field';
import { FieldProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

export type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'text' | 'email' | 'tel';
    containerProps?: ComponentProps<'div'>;
  } & ComponentProps<typeof Input>
>;

export const FieldText = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldTextProps<TFieldValues, TName>
) => {
  const {
    name,
    type,
    disabled,
    defaultValue,
    shouldUnregister,
    control,
    containerProps,
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
      render={({ field, fieldState }) => (
        <div
          {...containerProps}
          className={cn(
            'flex flex-1 flex-col gap-1',
            containerProps?.className
          )}
        >
          <Input
            type={type}
            id={ctx.id}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={
              !fieldState.error
                ? `${ctx.descriptionId}`
                : `${ctx.descriptionId} ${ctx.errorId}`
            }
            {...rest}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              rest.onChange?.(e);
            }}
            onBlur={(e) => {
              field.onBlur();
              rest.onBlur?.(e);
            }}
          />
          <FormFieldError />
        </div>
      )}
    />
  );
};
