import * as React from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import {
  NestedCheckbox,
  NestedCheckboxProps,
} from '@/components/ui/nested-checkbox-group/nested-checkbox';
import { NestedCheckboxGroup } from '@/components/ui/nested-checkbox-group/nested-checkbox-group';

export type NestedCheckboxOption = Omit<
  NestedCheckboxProps,
  'children' | 'value' | 'render'
> & {
  label: string;
  value: string;
  children?: Array<NestedCheckboxOption>;
};

export type FieldNestedCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<
  TFieldValues,
  TName,
  {
    type: 'nested-checkbox-group';
    options: Array<NestedCheckboxOption>;
    containerProps?: React.ComponentProps<'div'>;
  } & Omit<React.ComponentProps<typeof NestedCheckboxGroup>, 'allValues'>
>;

export const FieldNestedCheckboxGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldNestedCheckboxGroupProps<TFieldValues, TName>
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
            <NestedCheckboxGroup
              id={ctx.id}
              aria-invalid={isInvalid}
              aria-labelledby={ctx.labelId}
              aria-describedby={
                !fieldState.error
                  ? `${ctx.descriptionId}`
                  : `${ctx.descriptionId} ${ctx.errorId}`
              }
              value={value}
              {...rest}
              onValueChange={(value) => {
                rest.onValueChange?.(value);
                onChange(value);
              }}
            >
              {renderOptions(options, {
                'aria-invalid': isInvalid,
                ...field,
              })}
            </NestedCheckboxGroup>
            <FormFieldError />
          </div>
        );
      }}
    />
  );
};

function renderOptions<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  options: NestedCheckboxOption[],
  commonProps: Omit<
    NestedCheckboxProps & ControllerRenderProps<TFieldValues, TName>,
    'value' | 'onChange' | 'onBlur'
  >,
  parent?: string
) {
  const Comp = parent ? 'div' : React.Fragment;
  const compProps = parent
    ? {
        className: 'flex flex-col gap-2 pl-4',
      }
    : {};
  return (
    <Comp {...compProps}>
      {options.map(({ children, label, ...option }) => (
        <React.Fragment key={option.value}>
          <NestedCheckbox parent={parent} {...option} {...commonProps}>
            {label}
          </NestedCheckbox>
          {children &&
            children.length > 0 &&
            renderOptions(children, commonProps, option.value)}
        </React.Fragment>
      ))}
    </Comp>
  );
}
