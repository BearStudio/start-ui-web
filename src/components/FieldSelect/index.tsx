import React, { useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';
import { GroupBase } from 'react-select';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Select, SelectProps } from '@/components/Select';

export type FieldSelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = FieldProps &
  FormGroupProps & {
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    options?: Option[];
    isClearable?: boolean;
    isSearchable?: boolean;
    selectProps?: SelectProps<Option, IsMulti, Group>;
  };

export const FieldSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: FieldSelectProps<Option, IsMulti, Group>
) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
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
  const showError = !isValid && (isTouched || isSubmitted);

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
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <Select
        id={id}
        value={options?.find((option) => option.value === value) || ''}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder || 'Select...'}
        onChange={(fieldValue) =>
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
