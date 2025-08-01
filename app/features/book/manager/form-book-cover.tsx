import { useQuery } from '@tanstack/react-query';
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
  return (
    <BookCover
      book={{
        title,
        author,
        genre,
      }}
    />
  );
};
