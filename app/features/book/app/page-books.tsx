import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';

import { BookCover } from '@/features/book/book-cover';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageBooks = () => {
  const booksQuery = useInfiniteQuery(
    orpc.book.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const ui = getUiState((set) => {
    if (booksQuery.status === 'pending') return set('pending');
    if (booksQuery.status === 'error') return set('error');

    const items = booksQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Books</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <>Loading...</>)
          .match('error', () => <PageError />)
          .match('empty', () => <>No books</>)
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-4 pb-20">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to="/app/books/$id"
                    params={{ id: item.id }}
                    className="group"
                  >
                    <BookCover
                      book={item}
                      className="transition duration-500 group-hover:-translate-y-2 group-hover:rotate-1"
                    />
                  </Link>
                ))}
              </div>
              {booksQuery.hasNextPage && (
                <Button
                  variant="ghost"
                  onClick={() => booksQuery.fetchNextPage()}
                  loading={booksQuery.isFetchingNextPage}
                >
                  Load more
                </Button>
              )}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
