import React, { ReactNode, useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';
import { GroupBase, MultiValue, SingleValue } from 'react-select';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Select, SelectProps } from '@/components/Select';

export type FieldSelectProps<
  Option extends { label: ReactNode; value: unknown },
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = FieldProps<
  IsMulti extends true ? Array<Option['value']> : Option['value']
> &
  FormGroupProps & {
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    options?: Option[];
    isClearable?: boolean;
    isSearchable?: boolean;
    selectProps?: SelectProps<Option, IsMulti, Group>;
  };

export const FieldSelect = <
  Option extends { label: ReactNode; value: unknown },
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: FieldSelectProps<Option, IsMulti, Group>
) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    isPristine,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);
  const { required } = props;
  const {
    children,
    label,
    options = [],
    placeholder,
    helper,
    isDisabled,
    isClearable,
    isSearchable,
    size = 'md',
    selectProps,
    ...rest
  } = otherProps;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    isDisabled,
    ...rest,
  };

  // If we are in creatable mode, the onChange will add values to the Formiz value state
  // value is an Array so we filter the options to make sure we don't double it in the "label" section
  const getCreatedValues = () =>
    Array.isArray(value) &&
    (selectProps?.type === 'creatable' ||
      selectProps?.type === 'async-creatable')
      ? value
          // We do not want already available options, so we filter them.
          .filter((v) => !options.map((o) => o.value).includes(v))
          // We need to map the created values so they match the Option format
          .map((v) => ({ label: v, value: v }) as Option)
      : [];

  // We compute the final value.
  // If the FieldSelect is in multi mode, the value is an Array
  // If the FieldSelect is not in multi mode, then the value is a single element
  const finalValue = Array.isArray(value)
    ? [
        ...(options?.filter((option) => value.includes(option.value)) ?? []),
        ...getCreatedValues(),
      ]
    : options?.find((option) => option.value === value) ?? undefined;

  return (
    <FormGroup {...formGroupProps}>
      <Select<Option, IsMulti, Group>
        id={id}
        value={finalValue}
        onFocus={() => setIsTouched(false)}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder || 'Select...'}
        onChange={(fieldValue) => {
          if (isMultiValue<Option>(fieldValue)) {
            setValue(
              fieldValue.length
                ? (fieldValue.map((f) => f.value) as TODO)
                : null
            );
          } else {
            setValue(fieldValue ? (fieldValue.value as TODO) : null);
          }
        }}
        size={size}
        options={options}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isInvalid={showError}
        {...selectProps}
      />
      {children}
    </FormGroup>
  );
};

function isMultiValue<Option extends { label: ReactNode; value: unknown }>(
  value: MultiValue<Option> | SingleValue<Option>
): value is MultiValue<Option> {
  return Array.isArray(value);
}
