import { ReactNode } from '@tanstack/react-router';
import { ComponentProps } from 'react';
import {
  Controller,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { isNonNullish } from 'remeda';

import { cn } from '@/lib/tailwind/utils';
import { getUiState } from '@/lib/ui-state';

import { Radio, RadioGroup } from '@/components/ui/radio-group';

import { useFormField } from '../form-field';
import { FieldProps } from '../form-field-controller';
import { FormFieldError } from '../form-field-error';

type RadioOptionProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FieldRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<TFieldValues, TName> & {
  type: 'radio-group';
  options: Array<RadioOptionProps>;
  renderRadio?: (
    radioOptions: RadioOptionProps & { checked: boolean },
    fieldOptions: Parameters<
      Pick<ControllerProps<TFieldValues, TName>, 'render'>['render']
    >[0]
  ) => ReactNode;
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
    renderRadio,
    ...rest
  } = props;

  const ctx = useFormField();

  const ui = getUiState((set) => {
    if (isNonNullish(renderRadio)) {
      return set('render-radio', { renderRadio });
    }

    return set('default');
  });

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={(controllerRenderOptions) => {
        const {
          field: { onChange, onBlur, ...field },
          fieldState,
        } = controllerRenderOptions;

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
              {ui
                .match('render-radio', ({ renderRadio }) =>
                  options.map((option) =>
                    renderRadio(
                      {
                        ...option,
                        checked: option.value === field.value,
                      },
                      controllerRenderOptions
                    )
                  )
                )
                .match('default', () =>
                  options.map((option) => (
                    <Radio
                      key={`${ctx.id}-${option.value}`}
                      value={option.value}
                      disabled={option.disabled}
                      onBlur={onBlur}
                    >
                      {option.label}
                    </Radio>
                  ))
                )
                .exhaustive()}
            </RadioGroup>
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};
