import { ComponentProps } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { isNullish } from 'remeda';

import { cn } from '@/lib/tailwind/utils';

import { NumberInput } from '@/components/ui/number-input';

import { useFormField } from '../form-field';
import { FieldProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

export type FieldNumberProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'number';
    containerProps?: ComponentProps<'div'>;
    inCents?: boolean;
  } & ComponentProps<typeof NumberInput>
>;

export const FieldNumber = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldNumberProps<TFieldValues, TName>
) => {
  const {
    name,
    type,
    disabled,
    defaultValue,
    shouldUnregister,
    control,
    containerProps,
    inCents,
    ...rest
  } = props;

  const ctx = useFormField();

  const formatValue = (
    value: number | undefined | null,
    type: 'to-cents' | 'from-cents'
  ) => {
    if (isNullish(value)) return null;
    if (inCents !== true) return value ?? null;
    if (type === 'to-cents') return Math.round(value * 100);
    if (type === 'from-cents') return value / 100;
    return null;
  };

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        const { onChange, value, ...fieldProps } = field;
        return (
          <div
            {...containerProps}
            className={cn(
              'flex flex-1 flex-col gap-1',
              containerProps?.className
            )}
          >
            <NumberInput
              id={ctx.id}
              invalid={fieldState.error ? true : undefined}
              aria-describedby={
                !fieldState.error
                  ? `${ctx.descriptionId}`
                  : `${ctx.descriptionId} ${ctx.errorId}`
              }
              {...rest}
              {...fieldProps}
              value={formatValue(value, 'from-cents')}
              onValueChange={(value) => {
                onChange(formatValue(value, 'to-cents'));
                rest.onValueChange?.(value);
              }}
              onBlur={(e) => {
                field.onBlur();
                rest.onBlur?.(e);
              }}
            />
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};
