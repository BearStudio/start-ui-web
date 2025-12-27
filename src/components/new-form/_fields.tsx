import { FieldNumber } from './field-number';
import { FieldSelect } from './field-select';
import { FieldText } from './field-text';

export const fieldComponents = {
  text: FieldText,
  email: FieldText,
  tel: FieldText,
  select: FieldSelect,
  number: FieldNumber,
} as const;

export type FieldType = keyof typeof fieldComponents;
export type FieldComponent<TFieldType extends FieldType> =
  (typeof fieldComponents)[TFieldType];

export type FieldComponentProps<TFieldType extends FieldType> =
  React.ComponentProps<FieldComponent<TFieldType>>;
