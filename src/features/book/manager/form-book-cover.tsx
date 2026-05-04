import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';

import { BookCover } from '@/features/book/book-cover';
import { FormFieldsBook } from '@/features/book/schema';
import { genreQueries } from '@/server/functions/queries';

export const FormBookCover = () => {
  const form = useFormContext<FormFieldsBook>();
  const genresQuery = useQuery(genreQueries.getAllList());
  const title = useWatch({ name: 'title', control: form.control });
  const author = useWatch({ name: 'author', control: form.control });
  const genreId = useWatch({ name: 'genreId', control: form.control });
  const coverId = useWatch({ name: 'coverId', control: form.control });

  const genre = genresQuery.data?.items.find((item) => item.id === genreId);

  return (
    <BookCover
      book={{
        title,
        author,
        genre,
        coverId,
      }}
    />
  );
};
