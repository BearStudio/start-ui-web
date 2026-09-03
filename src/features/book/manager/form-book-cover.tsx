import { useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { useFormContext } from '@/components/form';

import { BookCover } from '@/features/book/book-cover';
import { FormFieldsBook } from '@/features/book/schema';

export const FormBookCover = () => {
  const form = useFormContext<FormFieldsBook>();
  const genresQuery = useQuery(orpc.genre.getAll.queryOptions());
  const title = useStore(form.store, (s) => s.values.title);
  const author = useStore(form.store, (s) => s.values.author);
  const genreId = useStore(form.store, (s) => s.values.genreId);
  const coverId = useStore(form.store, (s) => s.values.coverId);

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
