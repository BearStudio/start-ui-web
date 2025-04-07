import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { ReactNode } from 'react';

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

export const PageRepositories = () => {
  const search = useSearch({ from: '/manager/_layout/repositories/' });
  const repositories = useInfiniteQuery(
    orpc.repository.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        searchTerm: search.searchTerm,
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  if (repositories.status === 'pending') {
    return <PageWrapper>Loading...</PageWrapper>; // TODO Design
  }

  if (repositories.status === 'error') {
    return (
      <PageWrapper>
        <PageError />
      </PageWrapper>
    );
  }

  if (!repositories.data.pages.flatMap((p) => p.items).length) {
    return <PageWrapper>No Repo</PageWrapper>; // TODO Design
  }

  return (
    <PageWrapper>
      {repositories.data.pages
        .flatMap((p) => p.items)
        .map((item) => (
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
    </PageWrapper>
  );
};

const PageWrapper = (props: { children?: ReactNode }) => {
  const search = useSearch({ from: '/manager/_layout/repositories/' });
  const router = useRouter();

  const searchProps = {
    value: search.searchTerm ?? '',
    onChange: (value: string) =>
      router.navigate({
        to: '.',
        search: { searchTerm: value },
        replace: true,
      }),
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
        <h1 className="overflow-hidden text-base font-medium text-ellipsis md:text-sm">
          Repositories
        </h1>
        <SearchButton
          {...searchProps}
          className="-mx-2 md:hidden"
          size="icon-sm"
        />
        <SearchInput
          {...searchProps}
          size="sm"
          className="max-w-2xs max-md:hidden"
        />
      </PageLayoutTopBar>
      <PageLayoutContent>{props.children}</PageLayoutContent>
    </PageLayout>
  );
};
