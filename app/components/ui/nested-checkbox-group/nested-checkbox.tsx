import * as React from 'react';

import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { createCheckboxInterfaceSelector } from '@/components/ui/nested-checkbox-group/nested-checkbox-interface';
import { useCheckboxGroupStore } from '@/components/ui/nested-checkbox-group/store';

export type NestedCheckboxProps = Omit<CheckboxProps, 'parent' | 'value'> & {
  parent?: string;
  value: string;
};

export function NestedCheckbox({
  value,
  parent,
  disabled: disabledProp,
  defaultChecked,
  ...rest
}: NestedCheckboxProps) {
  const {
    checked: isChecked,
    indeterminate: isIndeterminate,
    disabled,
    onChange,
    actions,
  } = useCheckboxGroupStore(createCheckboxInterfaceSelector({ value }));

  React.useEffect(() => {
    if (!value) return;

    actions.register({ value, parent, disabled: disabledProp, defaultChecked });

    return () => actions.unregister({ value });
  }, [value, parent, disabledProp, defaultChecked, actions]);

  return (
    <Checkbox
      value={value}
      checked={isChecked}
      indeterminate={isIndeterminate}
      disabled={disabled}
      {...rest}
      onCheckedChange={(value, event) => {
        onChange(value);
        rest.onCheckedChange?.(value, event);
      }}
    />
  );
}
