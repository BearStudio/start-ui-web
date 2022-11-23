import { ReactNode, useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';
import { useTranslation } from 'react-i18next';
import { GroupBase, MultiValue } from 'react-select';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Select, SelectProps } from '@/components/Select';

type MinimumOption = { value: unknown; label: ReactNode };

export type FieldMultiSelectProps<
  Option extends MinimumOption,
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>
> = FieldProps<MultiValue<Option['value']>> & {
  isNotClearable?: boolean;
  noOptionsMessage?: string;
} & FormGroupProps & {
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    options?: Option[];
    isClearable?: boolean;
    isSearchable?: boolean;
    selectProps?: SelectProps<Option, IsMulti, Group>;
  };

export const FieldMultiSelect = <
  Option extends MinimumOption,
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
    isPristine,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField({ debounce: 0, ...props });
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
  } = otherProps;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const { t } = useTranslation(['components']);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  const handleChange = (optionsSelected: Option[]) => {
    if (!optionsSelected || !optionsSelected.length) {
      setValue(null);
      return;
    }
    setValue(optionsSelected?.map((option) => option?.value));
  };

  return (
    <FormGroup {...formGroupProps}>
      <Select
        id={id}
        value={options?.filter((option) => value?.includes(option.value)) || []}
        onFocus={() => setIsTouched(false)}
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
