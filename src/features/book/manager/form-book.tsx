import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsBook } from '@/features/book/schema';

export const FormBook = () => {
  const form = useFormContext<FormFieldsBook>();
  const { t } = useTranslation(['book']);

  const genresQuery = useQuery(orpc.genre.getAll.queryOptions());

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('book:common.title.label')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="title"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('book:common.author.label')}</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="author" />
      </FormField>

      <FormField>
        <FormFieldLabel>{t('book:common.genre.label')}</FormFieldLabel>
        <FormFieldController
          type="combobox"
          control={form.control}
          name="genreId"
          items={(genresQuery.data?.items ?? []).map((genre) => ({
            value: genre.id,
            label: genre.name,
          }))}
        />
      </FormField>

      <FormField>
        <FormFieldLabel>{t('book:common.publisher.label')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="publisher"
        />
      </FormField>
    </div>
  );
};
