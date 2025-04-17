import { ComponentProps } from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { useFormField } from '@/components/form/form-field';
import { FieldCommonProps } from '@/components/form/form-field-controller';
import { DatePicker } from '@/components/ui/date-picker';

export type FieldDateProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldCommonProps<TFieldValues, TName> & {
  type: 'date';
  containerProps?: ComponentProps<'div'>;
} & RemoveFromType<
    Omit<
      ComponentProps<typeof DatePicker>,
      'id' | 'aria-invalid' | 'aria-describedby'
    >,
    ControllerRenderProps
  >;

export const FieldDate = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldDateProps<TFieldValues, TName>
) => {
  const {
    name,
    control,
    disabled,
    defaultValue,
    shouldUnregister,
    type,
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
          <DatePicker
            id={ctx.id}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={
              !fieldState.error
                ? ctx.descriptionId
                : `${ctx.descriptionId} ${ctx.errorId}`
            }
            {...rest}
            {...field}
          />
        </div>
      )}
    />
  );
};
