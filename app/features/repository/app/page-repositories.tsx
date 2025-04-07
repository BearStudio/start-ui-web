import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageRepositories = () => {
  const repositories = useInfiniteQuery(
    orpc.repository.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
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
    if (!items.length) return 'empty';
    return 'default';
  };

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Repositories</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {match(getUiState())
          .with('pending', () => <>Loading...</>) // TODO Design
          .with('error', () => <PageError />)
          .with('empty', () => <>No Repo</>) // TODO Design
          .with('default', () => (
            <>
              {items.map((item) => (
                <Link
                  key={item.id}
                  to="/app/repositories/$id"
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
