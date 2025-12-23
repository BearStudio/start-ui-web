import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsSupplier } from '@/features/goodies/schema';

export const FormSupplier = () => {
  const form = useFormContext<FormFieldsSupplier>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Nom du fournisseur</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Contact</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="contact"
          autoFocus
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Site web</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="websiteUrl"
        />
      </FormField>
    </div>
  );
};
