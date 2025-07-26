import { CheckboxGroupStore } from '@/components/ui/nested-checkbox-group/store';

type Checkboxes = CheckboxGroupStore['checkboxes'];
export const allChecked = (checkboxes: Checkboxes) =>
  checkboxes.every((checkbox) => checkbox.checked === true);

export const allUnchecked = (checkboxes: Checkboxes) =>
  checkboxes.every((checkbox) => checkbox.checked === false);

export const getChildren = (checkboxes: Checkboxes, value: string) =>
  checkboxes.filter((cb) => cb.parent === value && !cb.disabled);
