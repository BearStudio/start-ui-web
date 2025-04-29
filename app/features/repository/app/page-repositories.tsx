import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageRepositories = () => {
  const repositoriesQuery = useInfiniteQuery(
    orpc.repository.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
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
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Repositories</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent className="flex">
        <div className="flex flex-1">
          {ui
            .match('pending', () => <>Loading...</>)
            .match('error', () => <PageError />)
            .match('empty', () => <>No repo</>)
            .match('default', ({ items }) => (
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
                {repositoriesQuery.hasNextPage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    onClick={() => repositoriesQuery.fetchNextPage()}
                    loading={repositoriesQuery.isFetchingNextPage}
                  >
                    Load more
                  </Button>
                )}
              </>
            ))
            .render()}
        </div>
        <div className="flex flex-1">
          {match(ui.state)
            .with(ui.with('pending'), () => <>Loading...</>) // TODO Design
            .with(ui.with('error'), () => <PageError />)
            .with(ui.with('empty'), () => <>No Repo</>) // TODO Design
            .with(ui.with('default'), ({ items }) => (
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
                {repositoriesQuery.hasNextPage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    onClick={() => repositoriesQuery.fetchNextPage()}
                    loading={repositoriesQuery.isFetchingNextPage}
                  >
                    Load more
                  </Button>
                )}
              </>
            ))
            .exhaustive()}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
