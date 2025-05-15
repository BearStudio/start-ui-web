import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';
import { defaultFromInfiniteQuery, getUiState } from '@/lib/ui-state';

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

  const ui = getUiState(defaultFromInfiniteQuery(repositoriesQuery));

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Repositories</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
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
      </PageLayoutContent>
    </PageLayout>
  );
};
