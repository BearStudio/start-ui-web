import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { join } from 'remeda';
import { toast } from 'sonner';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/platform/components/form';

import {
  bookCoverAcceptedFileTypes,
  FormFieldsBook,
} from '@/modules/book/presentation/schema';
import { openDemoModeDrawer } from '@/modules/demo/presentation';
import { genreQueries } from '@/modules/genre/client';
import { envClient } from '@/platform/env/client';

export const FormBook = () => {
  const form = useFormContext<FormFieldsBook>();
  const { t } = useTranslation(['book']);

  const genresQuery = useQuery(genreQueries.getAllList());

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

      <FormField>
        <FormFieldLabel>{t('book:common.uploadCover.label')}</FormFieldLabel>
        <FormFieldController
          type="upload-input"
          control={form.control}
          name="coverId"
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
        <FormFieldHelper>{t('book:common.uploadCover.helper')}</FormFieldHelper>
      </FormField>
    </div>
  );
};
