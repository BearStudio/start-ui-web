import { ReactNode } from 'react';

import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  PathValue,
} from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';
import { Select, SelectProps } from '@/components/Select';

type SelectRootProps = Pick<SelectProps, 'size' | 'placeholder' | 'autoFocus'>;

export type FieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'select';
  label?: ReactNode;
  helper?: ReactNode;
  options: Readonly<
    Readonly<{
      label: string;
      value: PathValue<TFieldValues, TName>;
    }>[]
  >;
  selectProps?: RemoveFromType<
    RemoveFromType<Omit<SelectProps, 'options' | 'value'>, SelectRootProps>,
    ControllerRenderProps
  >;
} & SelectRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldSelectProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field }) => {
        const { value, onChange, ...fieldProps } = field;
        const selectValue =
          props.options?.find((option) => option.value === value) ?? undefined;
        return (
          <FormFieldItem>
            {!!props.label && (
              <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
            )}
            <Select
              type="select"
              size={props.size}
              options={props.options}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              value={selectValue}
              // @ts-expect-error should fix the typing. This error pops when
              // we propagate the `selectProps`
              onChange={(option) => onChange(option?.value)}
              {...props.selectProps}
              {...fieldProps}
            />

            {!!props.helper && (
              <FormFieldHelper>{props.helper}</FormFieldHelper>
            )}
            <FormFieldError />
          </FormFieldItem>
        );
      }}
    />
  );
};
