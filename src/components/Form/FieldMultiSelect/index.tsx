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

export type FieldMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'multi-select';
  label?: ReactNode;
  helper?: ReactNode;
  options: ReadonlyArray<{
    label: string;
    value: PathValue<TFieldValues, TName>[number];
  }>;
  selectProps?: RemoveFromType<
    RemoveFromType<Omit<SelectProps, 'options' | 'value'>, SelectRootProps>,
    ControllerRenderProps
  >;
} & SelectRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldMultiSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldMultiSelectProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field: { value, onChange, ...field } }) => {
        const selectValues =
          props.options?.filter((option) => value?.includes(option.value)) ??
          undefined;
        return (
          <FormFieldItem>
            {!!props.label && (
              <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
            )}

            <Select
              type="select"
              isMulti
              size={props.size}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              value={selectValues}
              menuPortalTarget={document.body}
              options={props.options}
              onChange={(options) =>
                // @ts-expect-error TODO should fix the typing. This error pops when
                // we propagate the `selectProps`
                onChange(options.map((option) => option.value))
              }
              {...props.selectProps}
              {...field}
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
