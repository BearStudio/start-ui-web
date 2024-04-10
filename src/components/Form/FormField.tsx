import { Input, InputProps, Textarea } from '@chakra-ui/react';
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
> = {
  type: 'custom';
  optionalityHint?: 'required' | 'optional' | false;
} & ControllerProps<TFieldValues, TName>;

type FormFieldCommonProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { optionalityHint?: 'required' | 'optional' | false } & Omit<
  FormFieldItemProps,
  'children' | 'displayError'
> &
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

// TextArea props
type FormFieldPropsInputTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'textarea';
  placeholder?: string;
  size?: InputProps['size'];
  autoFocus?: boolean;
  rows?: number;
} & FormFieldCommonProps<TFieldValues, TName>;

// Select props
type FormFieldPropsSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'select';
  options: Readonly<{
    label: string;
    value: PathValue<TFieldValues, TName>;
  }>[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
} & FormFieldCommonProps<TFieldValues, TName>;

// Multi Select props
type FormFieldPropsMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'multi-select';
  options: Readonly<{
    label: string;
    value: PathValue<TFieldValues, TName>[number];
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
    | FormFieldPropsInputTextarea<TFieldValues, TName>
    | FormFieldPropsSelect<TFieldValues, TName>
    | FormFieldPropsMultiSelect<TFieldValues, TName>
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

      case 'textarea':
        return (
          <Controller
            {...props}
            render={({ field }) => (
              <FormFieldItem
                label={props.label}
                helper={props.helper}
                displayError
              >
                <FormFieldControl>
                  <Textarea
                    size={props.size}
                    placeholder={props.placeholder}
                    autoFocus={props.autoFocus}
                    rows={props.rows}
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

      case 'multi-select':
        return (
          <Controller
            {...props}
            render={({ field }) => {
              const { value, onChange, ...fieldProps } = field;
              const selectValues =
                props.options?.filter((option) =>
                  value.includes(option.value)
                ) ?? undefined;
              return (
                <FormFieldItem
                  label={props.label}
                  helper={props.helper}
                  displayError
                >
                  <FormFieldControl>
                    <Select
                      type="select"
                      isMulti
                      size={props.size}
                      options={props.options}
                      placeholder={props.placeholder}
                      autoFocus={props.autoFocus}
                      value={selectValues}
                      onChange={(options) =>
                        onChange(options.map((option) => option.value))
                      }
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
    <FormFieldContext.Provider
      value={{ name: props.name, optionalityHint: props.optionalityHint }}
    >
      {getField()}
    </FormFieldContext.Provider>
  );
};
