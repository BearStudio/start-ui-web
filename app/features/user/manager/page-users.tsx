import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
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

export const PageUsers = (props: { search: { searchTerm?: string } }) => {
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

  const users = useInfiniteQuery(
    orpc.user.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        searchTerm: props.search.searchTerm,
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const items = users.data?.pages.flatMap((p) => p.items) ?? [];

  const getUiState = () => {
    if (users.status === 'pending') return 'pending';
    if (users.status === 'error') return 'error';
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
          <ResponsiveIconButton label="New User" variant="secondary" size="sm">
            <PlusIcon />
          </ResponsiveIconButton>
        }
      >
        <PageLayoutTopBarTitle>Users</PageLayoutTopBarTitle>
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
              <DataListErrorState retry={() => users.refetch()} />
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
                          {item.name
                            ?.split(' ')
                            .slice(0, 2)
                            .map((s) => s[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="font-medium">
                        <Link
                          to="/manager/users" // TODO link
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {item.email}
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
                      disabled={!users.hasNextPage}
                      onClick={() => users.fetchNextPage()}
                      loading={users.isFetchingNextPage}
                    >
                      Load more
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      Showing {items.length} of {users.data?.pages[0]?.total}
                    </DataListText>
                  </DataListCell>
                </DataListRow>
              </>
            ))
            .exhaustive()}
        </DataList>{' '}
      </PageLayoutContent>
    </PageLayout>
  );
};
