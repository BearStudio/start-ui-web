import { useQuery } from '@tanstack/react-query';
import { useUploadFile } from 'better-upload/client';
import { useFormContext, useWatch } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import { BookCover } from '@/features/book/book-cover';
import { FormFieldsBook } from '@/features/book/schema';

export const FormBookCover = () => {
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
  });

  // [TODO] Handle upload errors

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
      </label>
    </div>
  );
};
