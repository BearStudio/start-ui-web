import { useQuery } from '@tanstack/react-query';

import { withForm } from '@/platform/components/form';

import { useCurrentScopeKey } from '@/modules/auth/client';
import { BookCover } from '@/modules/book/presentation/book-cover';
import { formBookDefaultValues } from '@/modules/book/presentation/manager/form-book';
import { genreQueries } from '@/modules/genre/client';

/**
 * Live preview of the book cover that subscribes to the parent form's
 * `title`, `author`, `genreId`, and `coverId` and re-renders when any change.
 */
export const FormBookCover = withForm({
  defaultValues: formBookDefaultValues(),
  render: ({ form }) => {
    const scopeKey = useCurrentScopeKey();
    const genresQuery = useQuery(genreQueries.getAllList({ scopeKey }));
    return (
      <form.Subscribe
        selector={(s) => ({
          title: s.values.title,
          author: s.values.author,
          genreId: s.values.genreId,
          coverId: s.values.coverId,
        })}
      >
        {({ title, author, genreId, coverId }) => {
          const genre = genresQuery.data?.items.find(
            (item) => item.id === genreId
          );
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
        }}
      </form.Subscribe>
    );
  },
});
