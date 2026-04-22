import { useFormContext, useWatch } from 'react-hook-form';

import { BookCover } from '@/features/book/book-cover';
import { FormFieldsBook } from '@/features/book/schema';
import { Genre } from '@/features/genre/schema';

export const FormBookCover = (props: { genres: Genre[] }) => {
  const form = useFormContext<FormFieldsBook>();
  const title = useWatch({ name: 'title', control: form.control });
  const author = useWatch({ name: 'author', control: form.control });
  const genreId = useWatch({ name: 'genreId', control: form.control });
  const coverId = useWatch({ name: 'coverId', control: form.control });

  const genre = props.genres.find((item) => item.id === genreId);

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
