import { FieldCheckbox } from './field-checkbox';
import { FieldCheckboxGroup } from './field-checkbox-group';
import { FieldCombobox } from './field-combobox';
import { FieldComboboxMultiple } from './field-combobox-multiple';
import { FieldDate } from './field-date';
import { FieldNumber } from './field-number';
import { FieldOtp } from './field-otp';
import { FieldRadioGroup } from './field-radio-group';
import { FieldSelect } from './field-select';
import { FieldText } from './field-text';
import { FieldTextarea } from './field-textarea';

export const fieldComponents = {
  text: FieldText,
  textarea: FieldTextarea,
  email: FieldText,
  tel: FieldText,
  select: FieldSelect,
  combobox: FieldCombobox,
  'combobox-multiple': FieldComboboxMultiple,
  number: FieldNumber,
  otp: FieldOtp,
  date: FieldDate,
  checkbox: FieldCheckbox,
  'checkbox-group': FieldCheckboxGroup,
  'radio-group': FieldRadioGroup,
} as const;

export type FieldType = keyof typeof fieldComponents;
export type FieldComponent<TFieldType extends FieldType> =
  (typeof fieldComponents)[TFieldType];

export type FieldComponentProps<TFieldType extends FieldType> =
  React.ComponentProps<FieldComponent<TFieldType>>;
