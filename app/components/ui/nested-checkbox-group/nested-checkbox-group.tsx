import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

import {
  CheckboxGroupContext,
  createCheckboxGroupStore,
  CreateCheckboxGroupStoreOptions,
} from '@/components/ui/nested-checkbox-group/store';

export type NestedCheckboxGroupProps = React.ComponentProps<'div'> &
  CreateCheckboxGroupStoreOptions & {
    /** Controlled list of checked values */
    value?: string[];
    /** Called whenever checked values change */
    onValueChange?: (values: string[]) => void;
  };
export function NestedCheckboxGroup({
  className,
  disabled,
  value,
  onValueChange,
  ...rest
}: NestedCheckboxGroupProps) {
  const [checkboxStore] = React.useState(() =>
    createCheckboxGroupStore({ disabled })
  );

  // Sync store with value (controlled)
  React.useEffect(() => {
    if (!value) return;
    checkboxStore.setState((state) => {
      const updated = state.checkboxes.map((cb) => ({
        ...cb,
        checked: value.includes(cb.value),
      }));
      return { checkboxes: updated };
    });
  }, [value, checkboxStore]);

  React.useEffect(() => {
    if (!onValueChange) return;

    return checkboxStore.subscribe((state) => {
      const newValues = state.value();
      onValueChange(newValues);
    });
  }, [onValueChange, checkboxStore]);

  return (
    <CheckboxGroupContext value={checkboxStore}>
      <div className={cn('flex flex-col gap-2', className)} {...rest} />
    </CheckboxGroupContext>
  );
}
