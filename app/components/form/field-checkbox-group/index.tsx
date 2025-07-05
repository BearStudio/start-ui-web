import { ComponentProps, ReactNode } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

type CheckboxOption = Omit<CheckboxProps, 'children' | 'render'> & {
  label: ReactNode;
};
export type FieldCheckboxGroupProps<
  TFIeldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFIeldValues> = FieldPath<TFIeldValues>,
> = FieldProps<
  TFIeldValues,
  TName,
  {
    type: 'checkbox-group';
    options: Array<CheckboxOption>;
    containerProps?: ComponentProps<'div'>;
  } & ComponentProps<typeof CheckboxGroup>
>;

export const FieldCheckboxGroup = <
  TFIeldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFIeldValues> = FieldPath<TFIeldValues>,
>(
  props: FieldCheckboxGroupProps<TFIeldValues, TName>
) => {
  const {
    type,
    name,
    control,
    defaultValue,
    disabled,
    shouldUnregister,
    containerProps,
    options,
    ...rest
  } = props;

  const ctx = useFormField();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      disabled={disabled}
      shouldUnregister={shouldUnregister}
      render={({ field: { value, onChange, ...field }, fieldState }) => {
        const isInvalid = fieldState.error ? true : undefined;
        return (
          <div
            {...containerProps}
            className={cn('', containerProps?.className)}
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
              onValueChange={onChange}
              {...rest}
            >
              {options.map(({ label, ...option }) => (
                <Checkbox
                  key={option.value}
                  {...option}
                  aria-invalid={isInvalid}
                  {...field}
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
