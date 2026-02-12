import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListRowResults,
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import { BookCover } from '@/features/book/book-cover';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageBooks = (props: { search: { searchTerm?: string } }) => {
  const router = useRouter();
  const { t } = useTranslation(['book']);

  const searchInputProps = {
    value: props.search.searchTerm ?? '',
    onChange: (value: string) =>
      router.navigate({
        to: '.',
        search: { searchTerm: value },
        replace: true,
      }),
  };

  const booksQuery = useInfiniteQuery(
    orpc.book.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        searchTerm: props.search.searchTerm,
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

    const searchTerm = props.search.searchTerm;
    const items = booksQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length && searchTerm) {
      return set('empty-search', { searchTerm });
    }
    if (!items.length) return set('empty');

    return set('default', {
      items,
      searchTerm,
      total: booksQuery.data.pages[0]?.total ?? 0,
    });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButtonLink
            label={t('book:manager.new.title')}
            variant="secondary"
            size="sm"
            to="/manager/books/new"
          >
            <PlusIcon />
          </ResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>
          {t('book:manager.list.title')}
        </PageLayoutTopBarTitle>
        <SearchButton
          {...searchInputProps}
          className="-mx-2 md:hidden"
          size="icon-sm"
        />
        <SearchInput
          {...searchInputProps}
          size="sm"
          className="max-w-2xs max-md:hidden"
        />
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => booksQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('empty-search', ({ searchTerm }) => (
              <DataListEmptyState searchTerm={searchTerm} />
            ))
            .match('default', ({ items, searchTerm, total }) => (
              <>
                {!!searchTerm && (
                  <DataListRowResults
                    withClearButton
                    onClear={() => {
                      router.navigate({
                        to: '.',
                        search: { searchTerm: '' },
                        replace: true,
                      });
                    }}
                  >
                    {t('book:manager.list.searchResults', {
                      total,
                      searchTerm,
                    })}
                  </DataListRowResults>
                )}
                {items.map((item) => (
                  <DataListRow key={item.id} withHover>
                    <DataListCell className="flex-none">
                      <div aria-hidden>
                        <BookCover book={item} variant="tiny" />
                      </div>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="font-medium">
                        <Link to="/manager/books/$id" params={{ id: item.id }}>
                          {item.title}
                          <span className="absolute inset-0" />
                        </Link>
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {item.author}
                      </DataListText>
                    </DataListCell>
                    <DataListCell>
                      {item.genre && (
                        <DataListText className="text-xs text-muted-foreground">
                          {item.genre.name}
                        </DataListText>
                      )}
                    </DataListCell>
                    <DataListCell>
                      {item.publisher && (
                        <DataListText className="text-xs text-muted-foreground">
                          {item.publisher}
                        </DataListText>
                      )}
                    </DataListCell>
                  </DataListRow>
                ))}
                <DataListRow>
                  <DataListCell className="flex-none">
                    <Button
                      size="xs"
                      variant="secondary"
                      disabled={!booksQuery.hasNextPage}
                      onClick={() => booksQuery.fetchNextPage()}
                      loading={booksQuery.isFetchingNextPage}
                    >
                      {t('book:manager.list.loadMore')}
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      {t('book:manager.list.showing', {
                        count: items.length,
                        total,
                      })}
                    </DataListText>
                  </DataListCell>
                </DataListRow>
              </>
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
