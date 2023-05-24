import React, {
  MutableRefObject,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Checkbox, CheckboxProps, Wrap, WrapItem } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';
import create, { StoreApi, UseBoundStore } from 'zustand';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Value = unknown;

type InternalOption = {
  value: Value;
  groups: Value[];
};

type Option = {
  value: Value;
  label?: ReactNode;
};

const formatGroupsToArray = (groups?: string[] | string): string[] => {
  if (!groups) return [];
  if (!Array.isArray(groups)) return [groups];
  return groups;
};

const splitValuesByGroupsFromOptions = (
  options: InternalOption[],
  groups: Value[] = []
): [Value[], Value[]] =>
  options.reduce(
    ([inGroups, others], option) => {
      const hasNoGroups = groups.length === 0;
      const isInGroups = option.groups.some((group) => groups.includes(group));
      return hasNoGroups || isInGroups
        ? [[...inGroups, option.value], others]
        : [inGroups, [...others, option.value]];
    },
    [[], []] as ExplicitAny
  );

type FieldCheckboxesState = {
  options: InternalOption[];
  registerOption: (option: InternalOption, isChecked: boolean) => void;
  unregisterOption: (option: InternalOption) => void;
  values: Value[];
  setValues: (values: Value[]) => void;
  toggleValue: (value: Value) => void;
  toggleGroups: (groups: string[]) => void;
  verifyIsValueChecked: (value: Value) => boolean;
};

type FieldCheckboxesContextProps = {
  useStoreRef: MutableRefObject<UseBoundStore<StoreApi<FieldCheckboxesState>>>;
  checkboxGroupProps?: Pick<
    CheckboxProps,
    'size' | 'colorScheme' | 'isDisabled'
  >;
};

const FieldCheckboxesContext = createContext<FieldCheckboxesContextProps>(
  {} as TODO
);

type FieldCheckboxesProps<FormattedValue = Value[]> = FieldProps<
  Value[],
  FormattedValue
> &
  Omit<FormGroupProps, 'size'> &
  Pick<CheckboxProps, 'size' | 'colorScheme'> & {
    itemKey?: string;
    options?: Option[];
  };

export const FieldCheckboxes = <FormattedValue = Value[],>(
  props: FieldCheckboxesProps<FormattedValue>
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
  const itemKeyRef = useRef<string | undefined>(itemKey);
  if (itemKey) {
    itemKeyRef.current = itemKey;
  }

  const checkValuesEqual = useCallback((a: TODO, b: TODO): boolean => {
    const itemKeyValue = itemKeyRef.current;
    if (itemKeyValue) {
      return a?.[itemKeyValue] === b?.[itemKeyValue];
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }, []);

  const verifyValueIsInValues = (
    values: Value[],
    valueToVerify: Value
  ): boolean => !!values.find((item) => checkValuesEqual(item, valueToVerify));

  const useStoreRef = useRef<UseBoundStore<StoreApi<FieldCheckboxesState>>>();
  if (!useStoreRef.current) {
    const store = create<FieldCheckboxesState>((set, get) => ({
      options: [],
      registerOption: (
        optionToRegister: InternalOption,
        isChecked: boolean
      ) => {
        set((state) => ({ options: [...state.options, optionToRegister] }));
        setValue((prevValue) =>
          isChecked ? [...(prevValue ?? []), optionToRegister.value] : prevValue
        );
      },
      unregisterOption: (optionToUnregister: InternalOption) => {
        set((state) => ({
          options: state.options.filter(
            (option) =>
              !checkValuesEqual(option.value, optionToUnregister.value)
          ),
        }));
        setValue((prevValue) => {
          const newValue = (prevValue ?? []).filter((localValue) =>
            verifyValueIsInValues(
              get().options.map(({ value: optionValue }) => optionValue) ?? [],
              localValue
            )
          );
          return newValue.length ? newValue : null;
        });
      },
      values: value ?? [],
      setValues: (values) =>
        set(() => ({
          values,
        })),
      toggleValue: (valueToUpdate) => {
        setValue((prevValue) => {
          const previousValue = prevValue ?? [];
          const hasValue = verifyValueIsInValues(
            prevValue ?? [],
            valueToUpdate
          );
          const newValue = hasValue
            ? previousValue.filter(
                (localValue) => !checkValuesEqual(localValue, valueToUpdate)
              )
            : [...previousValue, valueToUpdate];
          return newValue.length ? newValue : null;
        });
      },
      toggleGroups: (groups: string[]) => {
        const [allValuesInGroups, allOtherValues] =
          splitValuesByGroupsFromOptions(get().options, groups);
        setValue((previousValue) => {
          const allOtherValuesChecked = allOtherValues.filter((otherValue) =>
            verifyValueIsInValues(previousValue ?? [], otherValue)
          );
          const areAllValuesInGroupCheck = allValuesInGroups.every(
            (valueInGroups) =>
              verifyValueIsInValues(previousValue ?? [], valueInGroups)
          );

          const newValue = areAllValuesInGroupCheck
            ? allOtherValuesChecked
            : [...allOtherValuesChecked, ...allValuesInGroups];
          return newValue.length ? newValue : null;
        });
      },
      verifyIsValueChecked: (valueToVerify: Value): boolean =>
        !!verifyValueIsInValues(get().values ?? [], valueToVerify),
    }));
    useStoreRef.current = store;
  }

  const setStoreValues = useStoreRef.current((state) => state.setValues);

  useEffect(() => {
    setStoreValues(value ?? []);
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
      <FieldCheckboxesContext.Provider value={contextValue as TODO}>
        {children ? (
          children
        ) : (
          <Wrap spacing="4" overflow="visible">
            {options?.map((option) => (
              <WrapItem key={String(option.value)}>
                <FieldCheckboxesItem value={option.value}>
                  {option.label ?? JSON.stringify(option.value)}
                </FieldCheckboxesItem>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </FieldCheckboxesContext.Provider>
    </FormGroup>
  );
};

type FieldCheckboxItemProps = Omit<CheckboxProps, 'value'> & {
  value: Value;
  groups?: string[] | string;
};

export const FieldCheckboxesItem: React.FC<
  React.PropsWithChildren<FieldCheckboxItemProps>
> = ({
  value,
  groups,
  onChange = () => undefined,
  children,
  defaultChecked,
  ...checkboxProps
}) => {
  const { useStoreRef, checkboxGroupProps } = useContext(
    FieldCheckboxesContext
  );
  const useStore = useStoreRef.current;

  const defaultCheckedRef = useRef(defaultChecked);
  defaultCheckedRef.current = defaultChecked;

  const registerOption = useStore((state) => state.registerOption);
  const unregisterOption = useStore((state) => state.unregisterOption);
  const toggleValue = useStore((state) => state.toggleValue);
  const isChecked = useStore((state) => state.verifyIsValueChecked(value));

  useEffect(() => {
    const option = { value, groups: formatGroupsToArray(groups) };

    registerOption(option, !!defaultCheckedRef.current);
    return () => unregisterOption(option);
  }, [value, groups, registerOption, unregisterOption]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

type FieldCheckboxItemCheckAllProps = CheckboxProps & {
  groups?: string[] | string;
};

export const FieldCheckboxesCheckAll: React.FC<
  React.PropsWithChildren<FieldCheckboxItemCheckAllProps>
> = ({
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

    const areAllValuesChecked =
      hasValuesInGroups && groupsValues.every(state.verifyIsValueChecked);
    const areSomeValuesChecked =
      hasValuesInGroups &&
      !areAllValuesChecked &&
      groupsValues.some(state.verifyIsValueChecked);

    return {
      isChecked: areAllValuesChecked,
      isIndeterminate: areSomeValuesChecked,
      isDisabled: !hasValuesInGroups,
    };
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
