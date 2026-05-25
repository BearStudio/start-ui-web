import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { join } from 'remeda';
import { toast } from 'sonner';

import {
  FormField,
  FormFieldHelper,
  FormFieldLabel,
  withForm,
} from '@/platform/components/form';

import {
  bookCoverAcceptedFileTypes,
  type FormFieldsBook,
  zFormFieldsBook,
} from '@/modules/book/presentation/schema';
import { openDemoModeDrawer } from '@/modules/demo/presentation';
import { genreQueries } from '@/modules/genre/client';
import { envClient } from '@/platform/env/client';

export const formBookDefaultValues = (
  values?: Partial<FormFieldsBook>
): FormFieldsBook => ({
  title: values?.title ?? '',
  author: values?.author ?? '',
  genreId: values?.genreId ?? '',
  publisher: values?.publisher ?? '',
  coverId: values?.coverId ?? '',
});

export const formBookValidators = {
  onSubmit: zFormFieldsBook(),
} as const;

export const FormBook = withForm({
  defaultValues: formBookDefaultValues(),
  render: ({ form }) => {
    const { t } = useTranslation(['book']);
    const genresQuery = useQuery(genreQueries.getAllList());

    return (
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>{t('book:common.title.label')}</FormFieldLabel>
          <form.AppField name="title">
            {(field) => <field.FieldText type="text" autoFocus />}
          </form.AppField>
        </FormField>
        <FormField>
          <FormFieldLabel>{t('book:common.author.label')}</FormFieldLabel>
          <form.AppField name="author">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
        </FormField>

        <FormField>
          <FormFieldLabel>{t('book:common.genre.label')}</FormFieldLabel>
          <form.AppField name="genreId">
            {(field) => (
              <field.FieldCombobox
                items={(genresQuery.data?.items ?? []).map((genre) => ({
                  value: genre.id,
                  label: genre.name,
                }))}
              />
            )}
          </form.AppField>
        </FormField>

        <FormField>
          <FormFieldLabel>{t('book:common.publisher.label')}</FormFieldLabel>
          <form.AppField name="publisher">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
        </FormField>

        <FormField>
          <FormFieldLabel>{t('book:common.uploadCover.label')}</FormFieldLabel>
          <form.AppField name="coverId">
            {(field) => (
              <field.FieldUploadInput
                uploadRoute="bookCover"
                inputProps={{
                  accept: join(bookCoverAcceptedFileTypes, ','),
                }}
                onError={() => {
                  if (envClient.VITE_IS_DEMO) {
                    openDemoModeDrawer();
                    return;
                  }
                  toast.error(t('book:manager.uploadErrors.failed'));
                }}
              />
            )}
          </form.AppField>
          <FormFieldHelper>
            {t('book:common.uploadCover.helper')}
          </FormFieldHelper>
        </FormField>
      </div>
    );
  },
});
