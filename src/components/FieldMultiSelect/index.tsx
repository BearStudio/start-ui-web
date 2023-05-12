import { ReactNode, useEffect, useState } from 'react';

import { FieldProps, useField } from '@formiz/core';
import { useTranslation } from 'react-i18next';
import { GroupBase } from 'react-select';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Select, SelectProps } from '@/components/Select';

export type FieldMultiSelectProps<
  Option extends { label: ReactNode; value: unknown },
  Group extends GroupBase<Option> = GroupBase<Option>
> = FieldProps<Array<Option['value']>> &
  FormGroupProps & {
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    options?: Option[];
    isClearable?: boolean;
    isSearchable?: boolean;
    selectProps?: SelectProps<Option, true, Group>;
    noOptionsMessage?: string;
  };

export const FieldMultiSelect = <
  Option extends { label: ReactNode; value: unknown },
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: FieldMultiSelectProps<Option, Group>
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
    noOptionsMessage,
    isDisabled,
    isClearable,
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
        isClearable={isClearable}
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
