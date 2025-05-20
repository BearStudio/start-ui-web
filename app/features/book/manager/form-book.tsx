import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsBook } from '@/features/book/schema';

export const FormBook = () => {
  const form = useFormContext<FormFieldsBook>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Title</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="title"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Author</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="author" />
      </FormField>

      <FormField>
        <FormFieldLabel>Genre</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="genre" />
      </FormField>

      <FormField>
        <FormFieldLabel>Publisher</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="publisher"
        />
      </FormField>
    </div>
  );
};
