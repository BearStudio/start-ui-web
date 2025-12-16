import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/errors/page-error';
import { Button } from '@/components/ui/button';

import { BookCover } from '@/features/book/book-cover';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageBooks = () => {
  const { t } = useTranslation(['book']);
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
        <PageLayoutTopBarTitle>
          {t('book:app.list.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <BookCover
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  key={index}
                  book={{}}
                  className="animate-pulse opacity-10"
                />
              ))}
            </div>
          ))
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('empty', () => (
            <div className="flex flex-1 text-sm text-muted-foreground">
              {t('book:common.notFound')}
            </div>
          ))
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
                {booksQuery.isFetchingNextPage &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <BookCover
                      // eslint-disable-next-line @eslint-react/no-array-index-key
                      key={index}
                      book={{}}
                      className="animate-pulse opacity-10"
                    />
                  ))}
              </div>

              {booksQuery.hasNextPage && (
                <Button
                  variant="ghost"
                  onClick={() => booksQuery.fetchNextPage()}
                  loading={booksQuery.isFetchingNextPage}
                >
                  {t('book:common.loadMore')}
                </Button>
              )}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
