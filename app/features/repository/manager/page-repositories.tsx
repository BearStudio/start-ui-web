import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
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
          <ResponsiveIconButton label="New Repo" size="sm">
            <PlusIcon />
          </ResponsiveIconButton>
        }
      >
        <h1 className="min-w-0 overflow-hidden text-base font-medium text-ellipsis whitespace-nowrap md:text-sm">
          Repositories
        </h1>
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
      <PageLayoutContent>
        {match(getUiState())
          .with('pending', () => <>Loading...</>) // TODO Design
          .with('error', () => <PageError />)
          .with('empty', () => <>No Repo</>) // TODO Design
          .with('empty-search', () => (
            <>No Repo found for {props.search.searchTerm}</>
          )) // TODO Design
          .with('default', () => (
            <>
              {items.map((item) => (
                <Link
                  key={item.id}
                  to="/manager/repositories/$id"
                  params={{ id: item.id }}
                >
                  Repo: {item.name}
                </Link>
              ))}
              {repositories.hasNextPage && (
                <Button
                  type="button"
                  size="sm"
                  variant="link"
                  onClick={() => repositories.fetchNextPage()}
                  loading={repositories.isFetchingNextPage}
                >
                  Load more
                </Button>
              )}
            </>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
