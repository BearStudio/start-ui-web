import { ReactNode, useState } from 'react';

type CheckboxOption = {
  label: ReactNode;
  value: string;
  children?: Array<CheckboxOption>;
};
export function useCheckboxGroup(
  options: Array<CheckboxOption>,
  params: {
    groups: string[];
    mainDefaultValue?: string[];
    nestedDefaultValue?: string[];
  }
) {
  const { groups, mainDefaultValue, nestedDefaultValue } = params;
  const mainAllValues = options.map((option) => option.value);

  const nestedAllValues =
    options
      .find((option) => option.value === groups[0])
      ?.children?.map((option) => option.value) ?? [];

  const [mainValue, setMainValue] = useState<string[]>(mainDefaultValue ?? []);
  const [nestedValue, setNestedValue] = useState<string[]>(
    nestedDefaultValue ?? []
  );

  const areAllNestedChecked = nestedValue.length === nestedAllValues.length;
  const isMainIndeterminate = nestedValue.length > 0 && !areAllNestedChecked;

  return {
    main: {
      allValues: mainAllValues,
      defaultValue: mainDefaultValue,
      value: mainValue,
      indeterminate: isMainIndeterminate,
      onValueChange: (value: string[]) => {
        // Update children value
        if (value.includes(groups[0]!)) {
          setNestedValue(nestedAllValues);
        } else if (areAllNestedChecked) {
          setNestedValue([]);
        }

        // Update self value
        setMainValue(value);
      },
    },
    nested: {
      allValues: nestedAllValues,
      defaultValue: nestedDefaultValue,
      value: nestedValue,
      onValueChange: (value: string[]) => {
        // Update parent value
        if (value.length === nestedAllValues.length) {
          setMainValue((prev) => Array.from(new Set([...prev, groups[0]!])));
        } else {
          setMainValue((prev) => prev.filter((v) => v !== groups[0]!));
        }

        // Update self value
        setNestedValue(value);
      },
    },
  };
}
