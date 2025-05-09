import { ComponentProps } from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { Radio, RadioGroup } from '@/components/ui/radio-group';

import { useFormField } from '../form-field';
import { FieldCommonProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

export type FieldRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldCommonProps<TFieldValues, TName> & {
  type: 'radio-group';
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  containerProps?: ComponentProps<'div'>;
} & RemoveFromType<
    Omit<
      ComponentProps<typeof RadioGroup>,
      'id' | 'aria-invalid' | 'aria-describedby'
    >,
    ControllerRenderProps
  >;

export const FieldRadioGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldRadioGroupProps<TFieldValues, TName>
) => {
  const {
    name,
    type,
    options,
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
      render={({ field: { onChange, onBlur, ...field }, fieldState }) => (
        <div
          {...containerProps}
          className={cn(
            'flex flex-1 flex-col gap-1',
            containerProps?.className
          )}
        >
          <RadioGroup
            id={ctx.id}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={
              !fieldState.error
                ? `${ctx.descriptionId}`
                : `${ctx.descriptionId} ${ctx.errorId}`
            }
            {...rest}
            onValueChange={onChange}
            {...field}
          >
            {options.map((option) => (
              <Radio
                key={`${ctx.id}-${option.value}`}
                value={option.value}
                disabled={option.disabled}
                onBlur={onBlur}
              >
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
          <FormFieldError />
        </div>
      )}
    />
  );
};
