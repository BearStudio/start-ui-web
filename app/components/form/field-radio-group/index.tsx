import * as React from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import { Radio, RadioGroup, RadioProps } from '@/components/ui/radio-group';

type RadioOption = Omit<RadioProps, 'children' | 'render'> & {
  label: string;
};

export type FieldRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'radio-group';
    options: Array<RadioOption>;
    renderOption?: (props: RadioOption) => React.JSX.Element;
    containerProps?: React.ComponentProps<'div'>;
  } & React.ComponentProps<typeof RadioGroup>
>;

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
    size,
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
            <RadioGroup
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
              {options.map(({ label, ...option }) => {
                const radioId = `${ctx.id}-${option.value}`;

                if (renderOption) {
                  return (
                    <React.Fragment key={radioId}>
                      {renderOption({
                        label,
                        'aria-invalid': isInvalid,
                        ...field,
                        ...option,
                      })}
                    </React.Fragment>
                  );
                }

                return (
                  <Radio
                    key={radioId}
                    aria-invalid={isInvalid}
                    size={size}
                    {...field}
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
