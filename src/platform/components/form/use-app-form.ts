import { createFormHook } from '@tanstack/react-form';

import { FieldCheckbox } from '@/platform/components/form/field-checkbox';
import { FieldCheckboxGroup } from '@/platform/components/form/field-checkbox-group';
import { FieldCombobox } from '@/platform/components/form/field-combobox';
import { FieldComboboxMultiple } from '@/platform/components/form/field-combobox-multiple';
import { FieldDate } from '@/platform/components/form/field-date';
import { FieldNumber } from '@/platform/components/form/field-number';
import { FieldOtp } from '@/platform/components/form/field-otp';
import { FieldRadioGroup } from '@/platform/components/form/field-radio-group';
import { FieldSelect } from '@/platform/components/form/field-select';
import { FieldText } from '@/platform/components/form/field-text';
import { FieldTextarea } from '@/platform/components/form/field-textarea';
import { FieldUploadInput } from '@/platform/components/form/field-upload-input';
import {
  fieldContext,
  formContext,
} from '@/platform/components/form/use-app-form-contexts';

/**
 * App-wide TanStack Form hook with every platform field component pre-bound.
 *
 * Usage:
 * ```tsx
 * const form = useAppForm({
 *   defaultValues: { email: '' },
 *   validators: { onSubmit: zFormFieldsLogin() },
 *   onSubmit: async ({ value }) => { ... },
 * });
 *
 * <Form form={form}>
 *   <form.AppField name="email">
 *     {(field) => <field.FieldText size="lg" />}
 *   </form.AppField>
 * </Form>
 * ```
 *
 * Replaces the old `useForm` + `<FormFieldController type="..." />` pattern.
 */
export const { useAppForm, useTypedAppFormContext, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FieldCheckbox,
    FieldCheckboxGroup,
    FieldCombobox,
    FieldComboboxMultiple,
    FieldDate,
    FieldNumber,
    FieldOtp,
    FieldRadioGroup,
    FieldSelect,
    FieldText,
    FieldTextarea,
    FieldUploadInput,
  },
  formComponents: {},
});
