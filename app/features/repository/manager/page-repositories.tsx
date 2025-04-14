import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { BookMarkedIcon, PlusIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageRepositories = (props: {
  search: { searchTerm?: string };
}) => {
  const router = useRouter();

  const searchInputProps = {
    value: props.search.searchTerm ?? '',
    onChange: (value: string) =>
      router.navigate({
        to: '.',
        search: { searchTerm: value },
        replace: true,
      }),
  };

  const repositoriesQuery = useInfiniteQuery(
    orpc.repository.getAll.infiniteOptions({
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
    if (repositoriesQuery.status === 'pending') return set('pending');
    if (repositoriesQuery.status === 'error') return set('error');

    const items = repositoriesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length && props.search.searchTerm) {
      return set('empty-search', { searchTerm: props.search.searchTerm });
    }
    if (!items.length) return set('empty');

    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <ResponsiveIconButton label="New Repo" variant="secondary" size="sm">
            <PlusIcon />
          </ResponsiveIconButton>
        }
      >
        <PageLayoutTopBarTitle>Repositories</PageLayoutTopBarTitle>
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
          {match(ui.state)
            .with(ui.with('pending'), () => <DataListLoadingState />)
            .with(ui.with('error'), () => (
              <DataListErrorState retry={() => repositoriesQuery.refetch()} />
            ))
            .with(ui.with('empty'), () => <DataListEmptyState />)
            .with(ui.with('empty-search'), ({ searchTerm }) => (
              <DataListEmptyState searchTerm={searchTerm} />
            ))
            .with(ui.with('default'), ({ items }) => (
              <>
                {items.map((item) => (
                  <DataListRow key={item.id} withHover>
                    <DataListCell className="flex-none">
                      <Avatar>
                        <AvatarFallback>
                          <BookMarkedIcon className="size-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="font-medium">
                        <Link
                          to="/manager/repositories/$id"
                          params={{ id: item.id }}
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {item.link}
                      </DataListText>
                    </DataListCell>
                  </DataListRow>
                ))}
                <DataListRow>
                  <DataListCell className="flex-none">
                    <Button
                      type="button"
                      size="xs"
                      variant="secondary"
                      disabled={!repositoriesQuery.hasNextPage}
                      onClick={() => repositoriesQuery.fetchNextPage()}
                      loading={repositoriesQuery.isFetchingNextPage}
                    >
                      Load more
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      Showing {items.length} of{' '}
                      {repositoriesQuery.data?.pages[0]?.total}
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
