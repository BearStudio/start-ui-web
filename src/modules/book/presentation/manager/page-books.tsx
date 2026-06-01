import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';

import { Button } from '@/platform/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListRowResults,
  DataListText,
} from '@/platform/components/ui/datalist';
import { ResponsiveIconButtonLink } from '@/platform/components/ui/responsive-icon-button-link';
import { SearchButton } from '@/platform/components/ui/search-button';
import { SearchInput } from '@/platform/components/ui/search-input';

import { useCurrentScopeKey } from '@/modules/auth/client';
import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';

import { BookCover } from '../book-cover';
import { bookQueries } from '../queries';

export const PageBooks = (props: { search: { searchTerm?: string } }) => {
  const router = useRouter();
  const { t } = useTranslation(['book']);
  const scopeKey = useCurrentScopeKey();

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
    bookQueries.getAllInfinite({
      scopeKey,
      searchTerm: props.search.searchTerm,
    })
  );

  const searchTerm = props.search.searchTerm;
  const items = booksQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const total = booksQuery.data?.pages[0]?.total ?? 0;
  const ui = getUiState((set) =>
    match([booksQuery.status, items.length, Boolean(searchTerm)] as const)
      .with(['pending', P._, P._], () => set('pending'))
      .with(['error', P._, P._], () => set('error'))
      .with(['success', 0, true], () =>
        set('empty-search', { searchTerm: searchTerm ?? '' })
      )
      .with(['success', 0, false], () => set('empty'))
      .with(['success', P._, P._], () =>
        set('default', {
          items,
          searchTerm,
          total,
        })
      )
      .exhaustive()
  );

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
