import { NumberInputValueChangeDetails } from '@ark-ui/react/number-input';
import { ComponentProps } from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { NumberInput } from '@/components/ui/number-input';

import { useFormField } from '../form-field';
import { FieldCommonProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

export type FieldNumberProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldCommonProps<TFieldValues, TName> & {
  type: 'number';
  containerProps?: ComponentProps<'div'>;
} & RemoveFromType<
    Omit<
      ComponentProps<typeof NumberInput>,
      'id' | 'aria-invalid' | 'aria-describedby'
    >,
    ControllerRenderProps
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
        const { onChange, ...fieldProps } = field;
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
              aria-invalid={fieldState.error ? true : undefined}
              aria-describedby={
                !fieldState.error
                  ? `${ctx.descriptionId}`
                  : `${ctx.descriptionId} ${ctx.errorId}`
              }
              {...rest}
              {...fieldProps}
              onValueChange={(details: NumberInputValueChangeDetails) => {
                if (isNaN(details.valueAsNumber)) {
                  field.onChange(null);
                  return;
                }

                field.onChange(details.valueAsNumber);
              }}
            />
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};
