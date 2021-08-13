import React, {
  createContext,
  MutableRefObject,
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
import create, { UseStore } from 'zustand';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Value = unknown;

interface InternalOption {
  value: Value;
  groups: string[];
}

interface Option {
  value: Value;
  label?: ReactNode;
}

const formatGroupsToArray = (groups: string[] | string): string[] => {
  if (!groups) return [];
  if (!Array.isArray(groups)) return [groups];
  return groups;
};

const splitValuesByGroupsFromOptions = (
  options: InternalOption[],
  groups: string[] = []
): [Value[], Value[]] =>
  options.reduce(
    ([inGroups, others], option) => {
      const hasNoGroups = groups.length === 0;
      const isInGroups = option.groups.some((group) => groups.includes(group));
      return hasNoGroups || isInGroups
        ? [[...inGroups, option.value], others]
        : [inGroups, [...others, option.value]];
    },
    [[], []]
  );

interface FieldCheckboxesState {
  options: InternalOption[];
  registerOption: (option: InternalOption) => void;
  unregisterOption: (option: InternalOption) => void;
  values: Value[];
  setValues: (values: Value[]) => void;
  toggleValue: (value: Value) => void;
  toggleGroups: (groups: string[]) => void;
  verifyIsValueChecked: (value: Value) => boolean;
}

interface FieldCheckboxesContextProps {
  useStoreRef: MutableRefObject<UseStore<FieldCheckboxesState>>;
  checkboxGroupProps?: Pick<
    CheckboxProps,
    'size' | 'colorScheme' | 'isDisabled'
  >;
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

export const FieldCheckboxes: React.FC<FieldCheckboxesProps> = (props) => {
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
  const itemKeyRef = useRef<string>(itemKey);
  if (itemKey) {
    itemKeyRef.current = itemKey;
  }

  const checkValuesEqual = useCallback((a: Value, b: Value): boolean => {
    const itemKey = itemKeyRef.current;
    if (itemKey) {
      return a?.[itemKey] === b?.[itemKey];
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }, []);

  const verifyValueIsInValues = (
    values: Value[],
    valueToVerify: Value
  ): boolean => !!values.find((item) => checkValuesEqual(item, valueToVerify));

  const useStoreRef = useRef<UseStore<FieldCheckboxesState>>();
  if (!useStoreRef.current) {
    useStoreRef.current = create<FieldCheckboxesState>((set, get) => ({
      options: [],
      registerOption: (option: InternalOption) =>
        set((state) => ({ options: [...state.options, option] })),
      unregisterOption: (option: InternalOption) =>
        set((state) => ({
          options: state.options.filter(
            (o) => !checkValuesEqual(o.value, option.value)
          ),
        })),
      values: value,
      setValues: (values) =>
        set(() => ({
          values,
        })),
      toggleValue: (valueToUpdate) => {
        setValue((s) => {
          const previousValue = s ?? [];
          return previousValue.includes(valueToUpdate)
            ? previousValue.filter((x) => !checkValuesEqual(x, valueToUpdate))
            : [...previousValue, valueToUpdate];
        });
      },
      toggleGroups: (groups: string[]) => {
        const [
          allValuesInGroups,
          allOtherValues,
        ] = splitValuesByGroupsFromOptions(get().options, groups);
        setValue((previousValue) => {
          const allOtherValuesChecked = allOtherValues.filter((otherValue) =>
            verifyValueIsInValues(previousValue, otherValue)
          );
          const areAllValuesInGroupCheck = allValuesInGroups.every(
            (valueInGroups) =>
              verifyValueIsInValues(previousValue, valueInGroups)
          );

          return areAllValuesInGroupCheck
            ? allOtherValuesChecked
            : [...allOtherValuesChecked, ...allValuesInGroups];
        });
      },
      verifyIsValueChecked: (valueToVerify: Value): boolean =>
        !!verifyValueIsInValues(get().values, valueToVerify),
    }));
  }

  const setStoreValues = useStoreRef.current((state) => state.setValues);

  const internalOptions = useStoreRef.current((state) => state.options);
  // Filter value without associated options.
  useEffect(() => {
    setValue((s) =>
      s.filter((x) => internalOptions.map(({ value: v }) => v).includes(x))
    );
  }, [internalOptions, setValue]);

  useEffect(() => {
    setStoreValues(value);
  }, [setStoreValues, value]);

  const contextValue = useMemo(
    () => ({
      useStoreRef,
      checkboxGroupProps: { size, colorScheme, isDisabled },
    }),
    [size, colorScheme, isDisabled]
  );

  const { required } = props;
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
      <FieldCheckboxesContext.Provider value={contextValue}>
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
  onChange = () => undefined,
  children,
  ...checkboxProps
}) => {
  const { useStoreRef, checkboxGroupProps } = useContext(
    FieldCheckboxesContext
  );
  const useStore = useStoreRef.current;

  const registerOption = useStore((state) => state.registerOption);
  const unregisterOption = useStore((state) => state.unregisterOption);
  const toggleValue = useStore((state) => state.toggleValue);
  const isChecked = useStore((state) => state.values.includes(value));

  useEffect(() => {
    const option = { value, groups: formatGroupsToArray(groups) };

    registerOption(option);
    return () => unregisterOption(option);
  }, [value, groups, registerOption, unregisterOption]);

  const handleChange = (event) => {
    onChange(event);
    toggleValue(value);
  };

  return (
    <Checkbox
      {...checkboxGroupProps}
      {...checkboxProps}
      onChange={handleChange}
      isChecked={isChecked}
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
  onChange = () => undefined,
  children,
  ...checkboxProps
}) => {
  const { checkboxGroupProps, useStoreRef } = useContext(
    FieldCheckboxesContext
  );
  const groupsArray = formatGroupsToArray(groups);

  const useStore = useStoreRef.current;

  const toggleGroups = useStore((state) => state.toggleGroups);
  const { isChecked, isIndeterminate, isDisabled } = useStore((state) => {
    const [groupsValues] = splitValuesByGroupsFromOptions(
      state.options,
      groupsArray
    );
    const hasValuesInGroups = groupsValues.length > 0;

    const isChecked =
      hasValuesInGroups && groupsValues.every(state.verifyIsValueChecked);
    const isIndeterminate =
      hasValuesInGroups &&
      !isChecked &&
      groupsValues.some(state.verifyIsValueChecked);

    return {
      isChecked,
      isIndeterminate,
      isDisabled: !hasValuesInGroups,
    };
  });

  const handleChange = (event) => {
    onChange(event);
    toggleGroups(groupsArray);
  };

  return (
    <Checkbox
      {...checkboxGroupProps}
      {...checkboxProps}
      onChange={handleChange}
      isChecked={isChecked}
      isIndeterminate={isIndeterminate}
      isDisabled={isDisabled}
    >
      {children}
    </Checkbox>
  );
};
