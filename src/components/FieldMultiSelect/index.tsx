import { useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';
import { useTranslation } from 'react-i18next';
import { GroupBase } from 'react-select';

import { FieldSelectProps, FormGroup, Select } from '@/components';

export type FieldMultiSelectProps<
  Option,
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>
> = FieldSelectProps<Option, IsMulti, Group> & {
  isNotClearable?: boolean;
  noOptionsMessage?: string;
};

export const FieldMultiSelect = <
  Option,
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: FieldMultiSelectProps<Option, IsMulti, Group>
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
    noOptionsMessage,
    isDisabled,
    isNotClearable,
    isSearchable,
    size,
    selectProps = {},
    ...rest
  } = otherProps as Omit<
    FieldMultiSelectProps<Option, IsMulti, Group>,
    keyof FieldProps
  >;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && (isTouched || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const { t } = useTranslation();

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  const handleChange = (optionsSelected) => {
    if (!optionsSelected || !optionsSelected.length) {
      setValue(null);
      return;
    }
    setValue(optionsSelected?.map((option) => option.value));
  };

  return (
    <FormGroup {...formGroupProps}>
      <Select
        id={id}
        value={
          options?.filter((option: TODO) => value?.includes(option.value)) || []
        }
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder}
        onChange={handleChange as TODO}
        options={options}
        isDisabled={isDisabled}
        isClearable={!isNotClearable}
        isSearchable={isSearchable}
        noOptionsMessage={() =>
          noOptionsMessage || t('components:fieldMultiSelect.noOption')
        }
        isError={showError}
        size={size}
        isMulti
        {...selectProps}
      />
      {children}
    </FormGroup>
  );
};
