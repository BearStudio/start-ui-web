import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/page-error';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageRepository = (props: { params: { id: string } }) => {
  const repository = useQuery(
    orpc.repository.getById.queryOptions({ input: { id: props.params.id } })
  );

  const ui = getUiState((set) => {
    if (repository.status === 'pending') return set('pending');
    if (
      repository.status === 'error' &&
      repository.error instanceof ORPCError &&
      repository.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (repository.status === 'error') return set('error');
    return set('default', { repository: repository.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        leftActions={
          <div className="flex items-center gap-3">
            <div className="-mx-1">
              <BackButton />
            </div>
            <Separator orientation="vertical" className="h-4" />
          </div>
        }
      >
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match(['not-found', 'error'], () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ repository }) => <>{repository.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError error="404" />)
          .match('error', () => <PageError />)
          .match('default', ({ repository }) => <>{repository.name}</>)
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
