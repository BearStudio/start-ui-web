import { FormFieldError } from '@/components/form/form-field-error';
import { FieldSelect } from '@/components/new-form/field-select';
import { FieldText } from '@/components/new-form/field-text';
import { FormFieldDescription } from '@/components/new-form/form-field-description';
import { FormFieldLabel } from '@/components/new-form/form-field-label';

export const fieldComponents = {
  Label: FormFieldLabel,
  Text: FieldText,
  Select: FieldSelect,
  Description: FormFieldDescription,
  Error: FormFieldError,
  /**
   * Add new fields to include in the FormField render props.
   */
} as const;

export type FieldComponents = typeof fieldComponents;
