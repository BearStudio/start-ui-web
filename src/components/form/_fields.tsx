import { FieldCheckbox } from './field-checkbox';
import { FieldCheckboxGroup } from './field-checkbox-group';
import { FieldDate } from './field-date';
import { FieldNumber } from './field-number';
import { FieldOtp } from './field-otp';
import { FieldRadioGroup } from './field-radio-group';
import { FieldSelect } from './field-select';
import { FieldText } from './field-text';

export const fieldComponents = {
  text: FieldText,
  email: FieldText,
  tel: FieldText,
  select: FieldSelect,
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
