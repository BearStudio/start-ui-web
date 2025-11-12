import { useQuery } from '@tanstack/react-query';
import { useUploadFile } from 'better-upload/client';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldError,
} from '@/components/form';
import { UploadButton } from '@/components/ui/upload-button';

import { BookCover } from '@/features/book/book-cover';
import { FormFieldsBook } from '@/features/book/schema';

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
  const genre = genresQuery.data?.items.find((item) => item.id === genreId);

  const coverId = useWatch({
    name: 'coverId',
    control: form.control,
  });

  const { uploadedFile, control } = useUploadFile({
    route: 'bookCover',
    onUploadComplete: ({ file }) => {
      form.clearErrors('coverId');
      form.setValue('coverId', file.objectKey);
    },
    onError: (error) => {
      if (error.type === 'rejected') {
        // In this specific case, error should be a translated message
        // because rejected are custom errors thrown by the developper
        form.setError('coverId', {
          type: 'custom',
          message: error.message,
        });
      } else {
        form.setError('coverId', {
          type: 'custom',
          message: t(`book:manager.uploadErrors.${error.type}`),
        });
      }
    },
  });

  return (
    <FormField>
      <FormFieldController
        control={form.control}
        type="custom"
        name="coverId"
        render={() => {
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
                    coverId: uploadedFile?.objectKey ?? coverId,
                  }}
                />

                <UploadButton
                  className="absolute top-1/2 left-1/2 -translate-1/2 bg-black/50 text-white"
                  variant="ghost"
                  control={control}
                  disabled={form.formState.isSubmitting}
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
