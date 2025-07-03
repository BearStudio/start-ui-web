import * as React from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import {
  Radio,
  RadioGroup,
  RadioGroupProps,
  RadioProps,
} from '@/components/ui/radio-group';

type RadioOption = Omit<RadioProps, 'children' | 'render'> & {
  label: string;
};

export type FieldRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<TFieldValues, TName> & {
  type: 'radio-group';
  options: Array<RadioOption>;
  renderOption?: (props: RadioOption) => React.JSX.Element;
} & Omit<RadioGroupProps, 'id' | 'aria-invalid' | 'aria-describedby'> & {
    containerProps?: React.ComponentProps<'div'>;
  };

export const FieldRadioGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldRadioGroupProps<TFieldValues, TName>
) => {
  const {
    name,
    control,
    disabled,
    defaultValue,
    shouldUnregister,
    containerProps,
    options,
    renderOption,
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
      render={({ field: { onBlur, onChange, ...field }, fieldState }) => {
        return (
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
              {options.map(({ label, ...option }) => {
                if (renderOption) {
                  return (
                    <React.Fragment key={`${ctx.id}-${option.value}`}>
                      {renderOption({
                        label,
                        onBlur,
                        ...option,
                      })}
                    </React.Fragment>
                  );
                }

                return (
                  <Radio
                    key={`${ctx.id}-${option.value}`}
                    onBlur={onBlur}
                    {...option}
                  >
                    {label}
                  </Radio>
                );
              })}
            </RadioGroup>
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};
