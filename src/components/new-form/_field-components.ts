import { FieldSelect } from '@/components/new-form/field-select';
import { FieldText } from '@/components/new-form/field-text';
import { FormFieldLabel } from '@/components/new-form/form-field-label';

export const fieldComponents = {
  Label: FormFieldLabel,
  Text: FieldText,
  Select: FieldSelect,
  /**
   * Add new fields to include in the FormField render props.
   */
} as const;

export type FieldComponents = typeof fieldComponents;
