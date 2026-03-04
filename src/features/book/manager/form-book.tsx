import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { join } from 'remeda';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { envClient } from '@/env/client';
import {
  bookCoverAcceptedFileTypes,
  FormFieldsBook,
} from '@/features/book/schema';
import { openDemoModeDrawer } from '@/features/demo/demo-mode-drawer';

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

      <FormField>
        <FormFieldLabel>{t('book:manager.uploadCover')}</FormFieldLabel>
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
      </FormField>
    </div>
  );
};
