import {
  allChecked,
  allUnchecked,
  getChildren,
} from '@/components/ui/nested-checkbox-group/helpers';
import { CheckboxGroupStore } from '@/components/ui/nested-checkbox-group/store';

export type NestedCheckboxInterface = {
  checkboxes: CheckboxGroupStore['checkboxes'];
  checked: boolean;
  indeterminate?: boolean;
  disabled: boolean;
  actions: CheckboxGroupStore['actions'];
  onChange: (newChecked: boolean) => void;
};

export function createCheckboxInterfaceSelector({ value }: { value: string }) {
  return (state: CheckboxGroupStore): NestedCheckboxInterface => {
    const checkboxes = state.checkboxes;
    const checkbox = checkboxes.find((c) => c.value === value);
    const children = getChildren(checkboxes, value);

    const checked = checkbox?.checked === true;
    const disabled = !!checkbox?.disabled;
    const indeterminate =
      checkbox?.checked === 'indeterminate' ||
      (children.length > 0 && !allChecked(children) && !allUnchecked(children));

    const onChange = (newChecked: boolean) => {
      let updated = [...checkboxes];

      updateChildren(updated, value, disabled, newChecked);

      updated = updated.map((cb) =>
        cb.value === value ? { ...cb, checked: newChecked } : cb
      );

      updateParents(updated, value);

      state.actions.setCheckboxes(updated);
    };

    return {
      checkboxes,
      checked,
      disabled,
      indeterminate,
      onChange,
      actions: state.actions,
    };
  };
}

function updateChildren(
  checkboxes: CheckboxGroupStore['checkboxes'],
  value: string,
  disabled: boolean,
  newChecked: boolean
) {
  const children = getChildren(checkboxes, value);

  if (!children) return;
  for (const child of children) {
    if (disabled) child.disabled = true;

    if (!child.disabled) child.checked = newChecked;

    updateChildren(
      checkboxes,
      child.value,
      child.disabled || disabled,
      newChecked
    );
  }
}

function updateParents(
  updated: CheckboxGroupStore['checkboxes'],
  value: string
) {
  const checkbox = updated.find((cb) => cb.value === value);
  if (!checkbox) return;

  const children = getChildren(updated, value);
  if (children.length !== 0) checkbox.checked = getNewChecked(children);

  if (!checkbox.parent) return;

  updateParents(updated, checkbox.parent);
}

const getNewChecked = (children: CheckboxGroupStore['checkboxes']) => {
  if (allChecked(children)) return true;
  if (allUnchecked(children)) return false;
  return 'indeterminate';
};
