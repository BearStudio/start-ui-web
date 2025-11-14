import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { join } from 'remeda';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldError,
} from '@/components/form';
import { UploadButton } from '@/components/ui/upload-button';

import { BookCover } from '@/features/book/book-cover';
import {
  bookCoverAcceptedFileTypes,
  FormFieldsBook,
} from '@/features/book/schema';

export const FormBookCover = () => {
  const { t } = useTranslation(['book']);
  const form = useFormContext<FormFieldsBook>();
  const genresQuery = useQuery(orpc.genre.getAll.queryOptions());
  const title = useWatch({
    name: 'title',
    control: form.control,
  });
  const genreId = useWatch({
    name: 'genreId',
    control: form.control,
  });
  const author = useWatch({
    name: 'author',
    control: form.control,
  });
  const coverId = useWatch({
    name: 'coverId',
    control: form.control,
  });

  const genre = genresQuery.data?.items.find((item) => item.id === genreId);

  return (
    <FormField>
      <FormFieldController
        control={form.control}
        type="custom"
        name="coverId"
        render={({ field }) => {
          return (
            <>
              <div className="relative mb-2">
                <span className="sr-only">{t('book:manager.uploadCover')}</span>
                <BookCover
                  className="opacity-60"
                  book={{
                    title,
                    author,
                    genre,
                    coverId,
                  }}
                />

                <UploadButton
                  uploadRoute="bookCover"
                  inputProps={{
                    accept: join(bookCoverAcceptedFileTypes, ','),
                  }}
                  className="absolute top-1/2 left-1/2 -translate-1/2 bg-black/50 text-white"
                  variant="ghost"
                  onUploadSuccess={(file) =>
                    field.onChange(file.objectInfo.key)
                  }
                />
              </div>
              <FormFieldError />
            </>
          );
        }}
      />
    </FormField>
  );
};
