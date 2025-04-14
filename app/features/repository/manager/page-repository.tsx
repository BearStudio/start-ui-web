import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageRepository = (props: { params: { id: string } }) => {
  const repositoryQuery = useQuery(
    orpc.repository.getById.queryOptions({ input: { id: props.params.id } })
  );

  const ui = getUiState((set) => {
    if (repositoryQuery.status === 'pending') return set('pending');
    if (
      repositoryQuery.status === 'error' &&
      repositoryQuery.error instanceof ORPCError &&
      repositoryQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (repositoryQuery.status === 'error') return set('error');
    return set('default', { repository: repositoryQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={<BackButton />}
        actions={
          <>
            <ResponsiveIconButton variant="ghost" label="Delete">
              <Trash2Icon />
            </ResponsiveIconButton>
            <Button size="sm" variant="secondary">
              <PencilLineIcon />
              Edit
            </Button>
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {match(ui.state)
            .with(ui.with('pending'), () => <Skeleton className="h-4 w-48" />)
            .with(ui.with('not-found'), ui.with('error'), () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .with(ui.with('default'), ({ repository }) => (
              <>{repository.name}</>
            ))
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {match(ui.state)
          .with(ui.with('pending'), () => <Spinner full />)
          .with(ui.with('not-found'), () => <PageError errorCode={404} />)
          .with(ui.with('error'), () => <PageError />)
          .with(ui.with('default'), ({ repository }) => <>{repository.name}</>)
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
