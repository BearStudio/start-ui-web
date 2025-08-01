import * as React from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

type CheckboxOption = Omit<CheckboxProps, 'children' | 'value' | 'render'> & {
  label: string;
  value: string;
};

export type FieldCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'checkbox-group';
    options: Array<CheckboxOption>;
    containerProps?: React.ComponentProps<'div'>;
  } & Omit<React.ComponentProps<typeof CheckboxGroup>, 'allValues'>
>;

export const FieldCheckboxGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldCheckboxGroupProps<TFieldValues, TName>
) => {
  const {
    name,
    control,
    disabled,
    defaultValue,
    shouldUnregister,
    containerProps,
    options,
    size,
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
      render={({ field: { onChange, value, ...field }, fieldState }) => {
        const isInvalid = fieldState.error ? true : undefined;

        return (
          <div
            {...containerProps}
            className={cn(
              'flex flex-1 flex-col gap-1',
              containerProps?.className
            )}
          >
            <CheckboxGroup
              id={ctx.id}
              aria-invalid={isInvalid}
              aria-labelledby={ctx.labelId}
              aria-describedby={
                !fieldState.error
                  ? `${ctx.descriptionId}`
                  : `${ctx.descriptionId} ${ctx.errorId}`
              }
              value={value}
              onValueChange={(value, event) => {
                onChange?.(value);
                rest.onValueChange?.(value, event);
              }}
              {...rest}
            >
              {options.map(({ label, ...option }) => (
                <Checkbox
                  key={`${ctx.id}-${option.value}`}
                  aria-invalid={isInvalid}
                  size={size}
                  {...field}
                  {...option}
                >
                  {label}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};
