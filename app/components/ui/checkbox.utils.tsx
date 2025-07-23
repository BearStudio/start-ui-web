import { Dispatch, SetStateAction, useState } from 'react';
import { difference, unique } from 'remeda';

import { CheckboxOption } from '@/components/ui/checkbox-group';

type NestedGroupValues = Record<string, string[]>;
export function useCheckboxGroup(
  options: Array<CheckboxOption>,
  params: {
    groups: string[];
    mainDefaultValue?: string[];
    nestedDefaultValue?: NestedGroupValues;
  }
) {
  const { groups, mainDefaultValue, nestedDefaultValue } = params;

  const [mainValue, setMainValue] = useState<string[]>(mainDefaultValue ?? []);

  const nestedGroups = useNestedGroups(options, {
    groups: groups,
    defaultValues: nestedDefaultValue,
    onParentChange: setMainValue,
  });

  const topAllValues = options.map((option) => option.value);

  const allNestedGroupValues = nestedGroups.flatMap((group) => group.allValues);
  const mainAllValues = [...topAllValues, ...allNestedGroupValues];

  return {
    main: {
      allValues: mainAllValues,
      defaultValue: mainDefaultValue,
      value: mainValue,
      indeterminate: nestedGroups.some((group) => group.isMainIndeterminate),
      onValueChange: (value: string[]) => {
        // Update all nested groups values
        nestedGroups.forEach((group) => {
          if (value.includes(group.group)) {
            group.onValueChange(group.allValues);
          } else if (group.value?.length === group.allValues?.length) {
            group.onValueChange([]);
          }
        });

        // Update self value
        setMainValue(value);
      },
    },
    nested: Object.fromEntries(
      nestedGroups.map(({ isMainIndeterminate, group, ...nestedGroup }) => [
        group,
        nestedGroup,
      ])
    ),
  };
}

type OnParentChangeFn = (newMainValue: (prev: string[]) => string[]) => void;

function useNestedGroups(
  options: Array<CheckboxOption>,
  params: {
    groups: string[];
    defaultValues?: NestedGroupValues;
    onParentChange: OnParentChangeFn;
  }
) {
  const { defaultValues, groups, onParentChange } = params;

  const [nestedValues, setNestedValues] = useState<NestedGroupValues>(
    defaultValues ?? Object.fromEntries(groups.map((group) => [group, []]))
  );

  return groups.map((group) => {
    const {
      nestedValue,
      nestedAllValues,
      updateMainValue,
      setNestedValue: setOneNestedValue,
      isMainIndeterminate,
    } = getNestedValueParams({
      options,
      parentKey: group,
      onParentChange,
      nestedValues,
      setNestedValues,
    });

    return {
      group,
      value: nestedValue,
      onValueChange: (value: string[]) => {
        updateMainValue(value);
        setOneNestedValue(value);
      },
      allValues: nestedAllValues,
      isMainIndeterminate,
    };
  });
}

/**
 * Helper method to get the setters, getters and other param for the nested group associated with `parentKey`
 */
function getNestedValueParams({
  options,
  parentKey,
  onParentChange,
  nestedValues,
  setNestedValues,
}: {
  options: Array<CheckboxOption>;
  parentKey: string;
  onParentChange: OnParentChangeFn;
  nestedValues: NestedGroupValues;
  setNestedValues: Dispatch<SetStateAction<NestedGroupValues>>;
}) {
  const nestedAllValues =
    options
      .find((option) => option.value === parentKey)
      ?.children?.map((option) => option.value) ?? [];

  const updateMainValue = (newNested: string[]) => {
    const areAllChecked = newNested.length === nestedAllValues.length;
    const arePartiallyChecked = !areAllChecked && newNested.length > 0;

    const nestedWithParent = [...nestedAllValues, parentKey];
    const withoutValuesAndParent = difference(nestedWithParent);

    onParentChange((prev) => {
      console.log('prev', prev);

      console.log('test', newNested);
      if (areAllChecked) {
        return unique([...prev, parentKey, ...newNested]);
      }

      if (arePartiallyChecked) {
        return unique([...withoutValuesAndParent(prev), ...newNested]);
      }

      return withoutValuesAndParent(prev);
    });
  };

  const setOneNestedValue = (newNested: string[]) =>
    setNestedValues((prev) => ({
      ...prev,
      [parentKey]: newNested,
    }));

  return {
    nestedAllValues,
    updateMainValue,
    nestedValue: nestedValues[parentKey] ?? [], // We know this exists hence the type cast
    setNestedValue: setOneNestedValue,
    isMainIndeterminate:
      (nestedValues[parentKey]?.length ?? 0) > 0 &&
      (nestedValues[parentKey]?.length ?? 0) < nestedAllValues.length,
  };
}
