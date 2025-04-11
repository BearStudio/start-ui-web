import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

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
  const repository = useQuery(
    orpc.repository.getById.queryOptions({ input: { id: props.params.id } })
  );

  const uiState = (() => {
    if (repository.status === 'pending') return 'pending';
    if (
      repository.status === 'error' &&
      repository.error instanceof ORPCError &&
      repository.error.code === 'NOT_FOUND'
    )
      return 'not-found';
    if (repository.status === 'error') return 'error';
    return 'default';
  })();

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
          {match(uiState)
            .with('pending', () => <Skeleton className="h-4 w-48" />)
            .with('not-found', 'error', () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .with('default', () => <>{repository.data?.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {match(uiState)
          .with('pending', () => <Spinner full />)
          .with('not-found', () => <PageError errorCode={404} />)
          .with('error', () => <PageError />)
          .with('default', () => <>{repository.data?.name}</>)
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
