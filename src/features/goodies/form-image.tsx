import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsAsset } from '@/features/goodies/schema';

const ASSET_TYPE_OPTIONS = [
  { id: 'LOGO', label: 'Logo' },
  { id: 'MOCKUP', label: 'Mockup' },
  { id: 'PHOTO', label: 'Photo' },
  { id: 'OTHER', label: 'Autre' },
] as const;

export const FormImage = () => {
  const form = useFormContext<FormFieldsAsset>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Nom</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Type</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="type"
          options={ASSET_TYPE_OPTIONS}
        />
      </FormField>

      <FormField>
        <FormFieldLabel>URL</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="url" />
      </FormField>
    </div>
  );
};
