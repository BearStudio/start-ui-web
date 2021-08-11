import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Checkbox, CheckboxProps, Wrap, WrapItem } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

const formatGroupsToArray = (groups: string[] | string): string[] => {
  if (!groups) return [];
  if (!Array.isArray(groups)) return [groups];
  return groups;
};

type Value = unknown; // TODO: type this

interface InternalOption {
  value: Value;
  groups: string[];
}

interface Option {
  value: Value;
  label?: ReactNode;
}

interface FieldCheckboxesContextProps {
  checkboxGroupProps?: Pick<
    CheckboxProps,
    'size' | 'colorScheme' | 'isDisabled'
  >;
  registerOption(option: InternalOption): void;
  unregisterOption(option: InternalOption): void;
  handleGroupsChange(groups?: string[]): void;
  handleItemChange(option: InternalOption): void;
  splitValuesByGroups(groups?: string[]): [Value[], Value[]];
  verifyIsOptionChecked(value: Value): boolean;
}

const FieldCheckboxesContext = createContext<FieldCheckboxesContextProps>(
  undefined
);

interface FieldCheckboxesProps
  extends FieldProps,
    Omit<FormGroupProps, 'size'>,
    Pick<CheckboxProps, 'size' | 'colorScheme'> {
  itemKey?: string;
  options?: Option[];
}

interface FieldCheckboxesType extends React.FC<FieldCheckboxesProps> {
  Item?: React.FC<FieldCheckboxItemProps>;
  CheckAll?: React.FC<FieldCheckboxItemCheckAllProps>;
}

export const FieldCheckboxes: FieldCheckboxesType = (props) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField({ defaultValue: [], ...props });
  const {
    itemKey,
    children,
    options,
    label,
    helper,
    size = 'md',
    colorScheme,
    isDisabled,
    ...rest
  } = otherProps;
  const valueRef = useRef(value);
  valueRef.current = value;

  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && (isTouched || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const checkboxGroupProps = { size, colorScheme, isDisabled };
  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  const [internalOptions, setInternalOptions] = useState<InternalOption[]>([]);

  const checkValuesEqual = useCallback(
    (a: Value, b: Value) => {
      if (itemKey) {
        return a?.[itemKey] === b?.[itemKey];
      }
      return JSON.stringify(a) === JSON.stringify(b);
    },
    [itemKey]
  );

  const registerOption = useCallback((option: InternalOption) => {
    setInternalOptions((s) => [...s, option]);
  }, []);

  const unregisterOption = useCallback(
    (optionToDelete: InternalOption) => {
      setInternalOptions((s) =>
        s.filter(
          (option) => !checkValuesEqual(option.value, optionToDelete.value)
        )
      );
    },
    [checkValuesEqual]
  );

  useEffect(() => {
    setValue(
      valueRef.current.filter((x) =>
        internalOptions.some((option) => checkValuesEqual(option.value, x))
      )
    );
  }, [checkValuesEqual, internalOptions, setValue]);

  const verifyIsOptionChecked = (valueToVerify: Value): boolean =>
    !!value.find((item) => checkValuesEqual(item, valueToVerify));

  const splitValuesByGroups = (groups: string[] = []): [Value[], Value[]] =>
    internalOptions.reduce(
      ([inGroups, others], option) => {
        const hasNoGroups = groups.length === 0;
        const isInGroups = option.groups.some((group) =>
          groups.includes(group)
        );
        return hasNoGroups || isInGroups
          ? [[...inGroups, option.value], others]
          : [inGroups, [...others, option.value]];
      },
      [[], []]
    );

  const handleGroupsChange = (groups: string[] = []) => {
    const [allValuesInGroups, allOtherValues] = splitValuesByGroups(groups);
    const allOtherValuesChecked = allOtherValues.filter(verifyIsOptionChecked);

    setValue(
      allValuesInGroups.every(verifyIsOptionChecked)
        ? allOtherValuesChecked
        : [...allOtherValuesChecked, ...allValuesInGroups]
    );
  };

  const handleItemChange = (option: InternalOption) => {
    if (!verifyIsOptionChecked(option.value)) {
      setValue([...value, option.value]);
    } else {
      setValue(value.filter((item) => !checkValuesEqual(item, option.value)));
    }
  };

  return (
    <FormGroup {...formGroupProps}>
      <FieldCheckboxesContext.Provider
        value={{
          checkboxGroupProps,
          registerOption,
          unregisterOption,
          handleGroupsChange,
          handleItemChange,
          splitValuesByGroups,
          verifyIsOptionChecked,
        }}
      >
        {!!children ? (
          children
        ) : (
          <Wrap spacing="4">
            {options.map((option) => (
              <WrapItem key={option.value}>
                <FieldCheckboxesItem value={option.value}>
                  {option.label ?? option.value}
                </FieldCheckboxesItem>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </FieldCheckboxesContext.Provider>
    </FormGroup>
  );
};

interface FieldCheckboxItemProps extends Omit<CheckboxProps, 'value'> {
  value: Value;
  groups?: string[] | string;
}

export const FieldCheckboxesItem: React.FC<FieldCheckboxItemProps> = ({
  value,
  groups,
  onChange = () => {},
  children,
  ...checkboxProps
}) => {
  const {
    checkboxGroupProps,
    registerOption,
    unregisterOption,
    handleItemChange,
    verifyIsOptionChecked,
  } = useContext(FieldCheckboxesContext);

  const option = useMemo<InternalOption>(
    () => ({
      value,
      groups: formatGroupsToArray(groups),
    }),
    [value, groups]
  );
  const registerOptionRef = useRef(registerOption);
  registerOptionRef.current = registerOption;
  const unregisterOptionRef = useRef(unregisterOption);
  unregisterOptionRef.current = unregisterOption;

  useEffect(() => {
    registerOption(option);
    return () => unregisterOption(option);
  }, [option, registerOption, unregisterOption]);

  const handleChange = (event) => {
    handleItemChange(option);
    onChange(event);
  };

  return (
    <Checkbox
      {...checkboxGroupProps}
      {...checkboxProps}
      isChecked={verifyIsOptionChecked(value)}
      onChange={handleChange}
    >
      {children}
    </Checkbox>
  );
};

interface FieldCheckboxItemCheckAllProps extends CheckboxProps {
  groups?: string[] | string;
}

export const FieldCheckboxesCheckAll: React.FC<FieldCheckboxItemCheckAllProps> = ({
  groups = [],
  onChange = () => {},
  children,
  ...checkboxProps
}) => {
  const groupsArray = formatGroupsToArray(groups);

  const {
    checkboxGroupProps,
    handleGroupsChange,
    splitValuesByGroups,
    verifyIsOptionChecked,
  } = useContext(FieldCheckboxesContext);

  const handleChange = (event) => {
    handleGroupsChange(groupsArray);
    onChange(event);
  };

  const [groupsValues] = splitValuesByGroups(groupsArray);

  const hasValuesInGroups = groupsValues.length > 0;

  const isGroupChecked =
    hasValuesInGroups && groupsValues.every(verifyIsOptionChecked);
  const isGroupIndeterminate =
    hasValuesInGroups &&
    !isGroupChecked &&
    groupsValues.some(verifyIsOptionChecked);

  return (
    <Checkbox
      {...checkboxGroupProps}
      {...checkboxProps}
      onChange={handleChange}
      isChecked={isGroupChecked}
      isIndeterminate={isGroupIndeterminate}
      isDisabled={!hasValuesInGroups}
    >
      {children}
    </Checkbox>
  );
};
