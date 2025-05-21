import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsBook } from '@/features/book/schema';

export const FormBook = () => {
  const form = useFormContext<FormFieldsBook>();

  const genresQuery = useQuery(orpc.genre.getAll.queryOptions());

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
        <FormFieldController
          type="select"
          control={form.control}
          name="genre"
          options={(genresQuery.data?.items ?? []).map((genre) => ({
            id: genre.id,
            label: genre.name,
          }))}
        />
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
