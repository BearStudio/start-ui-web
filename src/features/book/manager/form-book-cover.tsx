import { useQuery } from '@tanstack/react-query';
import { useUploadFile } from 'better-upload/client';
import { Upload } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

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

  const { upload, uploadedFile } = useUploadFile({
    route: 'bookCover',
    onUploadComplete: ({ file }) => {
      form.setValue('coverId', file.objectKey);
    },
    onError: (error) => {
      if (error.type === 'rejected') {
        // In this specific case, error should be a translated message
        // because rejected are custom errors thrown by the developper
        toast.error(error.message);
      } else {
        toast.error(t(`book:manager.uploadErrors.${error.type}`));
      }
    },
  });

  return (
    <div className="relative">
      <label htmlFor="coverId">
        <input
          className="hidden"
          id="coverId"
          type="file"
          name="coverId"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              upload(e.target.files[0]);
            }
          }}
        />
        <input type="hidden" {...form.register('coverId')} />
        <BookCover
          className="hover:cursor-pointer"
          book={{
            title,
            author,
            genre,
            coverId: uploadedFile?.objectKey ?? coverId,
          }}
        />

        <span className="absolute top-1/2 left-1/2 z-10 flex origin-center -translate-1/2 cursor-pointer items-center gap-2 rounded bg-white px-2 py-1 text-black">
          <Upload size="16" />
          {t('book:manager.uploadCover')}
        </span>
      </label>
    </div>
  );
};
