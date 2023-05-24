import React, { ReactNode, useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';
import { GroupBase } from 'react-select';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Select, SelectProps } from '@/components/Select';

export type FieldSelectProps<
  Option extends { label: ReactNode; value: unknown },
  Group extends GroupBase<Option> = GroupBase<Option>
> = FieldProps<Option['value']> &
  FormGroupProps & {
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    options?: Option[];
    isClearable?: boolean;
    isSearchable?: boolean;
    selectProps?: SelectProps<Option, false, Group>;
  };

export const FieldSelect = <
  Option extends { label: ReactNode; value: unknown },
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: FieldSelectProps<Option, Group>
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

  return (
    <FormGroup {...formGroupProps}>
      <Select
        id={id}
        value={options?.find((option) => option.value === value) ?? undefined}
        onFocus={() => setIsTouched(false)}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder || 'Select...'}
        onChange={(fieldValue: TODO) =>
          setValue(fieldValue ? fieldValue.value : null)
        }
        size={size}
        options={options}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isError={showError}
        {...selectProps}
      />
      {children}
    </FormGroup>
  );
};
