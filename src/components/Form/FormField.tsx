import { ReactNode } from 'react';

import { Input, InputProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  PathValue,
} from 'react-hook-form';

import { Select } from '@/components/Select';

import { FormFieldContext } from './FormFieldContext';
import { FormFieldControl } from './FormFieldControl';
import { FormFieldItem, FormFieldItemProps } from './FormFieldItem';

type FormFieldPropsCustom<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { type: 'custom' } & ControllerProps<TFieldValues, TName>;

type FormFieldCommonProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FormFieldItemProps, 'children' | 'displayError'> &
  Omit<ControllerProps<TFieldValues, TName>, 'render'>;

// Input Text props
type FormFieldPropsInputText<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'text' | 'email' | 'number' | 'tel';
  placeholder?: string;
  size?: InputProps['size'];
  autoFocus?: boolean;
} & FormFieldCommonProps<TFieldValues, TName>;

// Select props
type FormFieldPropsSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'select';
  options: Readonly<{
    label: ReactNode;
    value: PathValue<TFieldValues, TName>;
  }>[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
} & FormFieldCommonProps<TFieldValues, TName>;

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props:
    | FormFieldPropsCustom<TFieldValues, TName>
    | FormFieldPropsInputText<TFieldValues, TName>
    | FormFieldPropsSelect<TFieldValues, TName>
) => {
  const getField = () => {
    switch (props.type) {
      case 'custom':
        return <Controller {...props} />;

      case 'text':
      case 'email':
      case 'number':
      case 'tel':
        return (
          <Controller
            {...props}
            render={({ field }) => (
              <FormFieldItem
                label={props.label}
                displayRequired={props.displayRequired}
                helper={props.helper}
                displayError
              >
                <FormFieldControl>
                  <Input
                    type={props.type}
                    size={props.size}
                    placeholder={props.placeholder}
                    autoFocus={props.autoFocus}
                    {...field}
                  />
                </FormFieldControl>
              </FormFieldItem>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            {...props}
            render={({ field }) => {
              const { value, onChange, ...fieldProps } = field;
              const selectValue =
                props.options?.find((option) => option.value === value) ??
                undefined;
              return (
                <FormFieldItem
                  label={props.label}
                  displayRequired={props.displayRequired}
                  helper={props.helper}
                  displayError
                >
                  <FormFieldControl>
                    <Select
                      type="select"
                      size={props.size}
                      options={props.options}
                      placeholder={props.placeholder}
                      autoFocus={props.autoFocus}
                      value={selectValue}
                      onChange={(option) => onChange(option?.value)}
                      {...fieldProps}
                    />
                  </FormFieldControl>
                </FormFieldItem>
              );
            }}
          />
        );
    }
  };
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      {getField()}
    </FormFieldContext.Provider>
  );
};
