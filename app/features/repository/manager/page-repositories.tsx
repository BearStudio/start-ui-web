import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { BookMarkedIcon, PlusIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

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

  const repositories = useInfiniteQuery(
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

  const items = repositories.data?.pages.flatMap((p) => p.items) ?? [];

  const getUiState = () => {
    if (repositories.status === 'pending') return 'pending';
    if (repositories.status === 'error') return 'error';
    if (!items.length && props.search.searchTerm) {
      return 'empty-search';
    }
    if (!items.length) return 'empty';
    return 'default';
  };

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
          {match(getUiState())
            .with('pending', () => <DataListLoadingState />)
            .with('error', () => (
              <DataListErrorState retry={() => repositories.refetch()} />
            ))
            .with('empty', () => <DataListEmptyState />)
            .with('empty-search', () => (
              <DataListEmptyState searchTerm={props.search.searchTerm} />
            ))
            .with('default', () => (
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
                      disabled={!repositories.hasNextPage}
                      onClick={() => repositories.fetchNextPage()}
                      loading={repositories.isFetchingNextPage}
                    >
                      Load more
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      Showing {items.length} of{' '}
                      {repositories.data?.pages[0]?.total}
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
