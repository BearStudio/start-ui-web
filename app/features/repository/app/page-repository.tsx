import { useQuery } from '@tanstack/react-query';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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

  const uiState = (() => {
    if (repository.status === 'pending') return 'pending';
    if (repository.status === 'error') return 'error';
    return 'default';
  })();

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
        rightActions={<Button size="sm">Save</Button>}
      >
        <PageLayoutTopBarTitle>
          {match(uiState)
            .with('pending', () => <Skeleton className="h-4 w-48" />)
            .with('error', () => 'ERROR') // TODO translation
            .with('default', () => <>{repository.data?.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>...</PageLayoutContent>
    </PageLayout>
  );
};
