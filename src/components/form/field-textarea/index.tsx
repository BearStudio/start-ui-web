import { ComponentProps } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { Textarea } from '@/components/ui/textarea';

import { useFormField } from '../form-field';
import { FieldProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

export type FieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldProps<
  TFieldValues,
  TName,
  TTransformedValues,
  {
    type: 'textarea';
    containerProps?: ComponentProps<'div'>;
  } & ComponentProps<typeof Textarea>
>;

export const FieldTextarea = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: FieldTextareaProps<TFieldValues, TName, TTransformedValues>
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
          <Textarea
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
