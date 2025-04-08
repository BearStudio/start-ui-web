import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageRepository = (props: { params: { id: string } }) => {
  const repository = useQuery(
    orpc.repository.getById.queryOptions({ input: { id: props.params.id } })
  );

  const getUiState = () => {
    if (repository.status === 'pending') return 'pending';
    if (repository.status === 'error') return 'error';
    return 'default';
  };

  return (
    <PageLayout>
      <PageLayoutTopBar
        leftActions={
          <div className="flex items-center gap-3">
            <div className="-mx-1">
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="rtl:rotate-180"
              >
                <Link to="..">
                  <ArrowLeftIcon />
                </Link>
              </Button>
            </div>
            <Separator orientation="vertical" className="h-4" />
          </div>
        }
        rightActions={<Button size="sm">Save</Button>}
      >
        <h1 className="min-w-0 overflow-hidden text-base font-medium text-ellipsis whitespace-nowrap md:text-sm">
          {match(getUiState())
            .with('pending', () => <Skeleton className="h-4 w-48" />)
            .with('error', () => 'ERROR') // TODO translation
            .with('default', () => <>{repository.data?.name}</>)
            .exhaustive()}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>...</PageLayoutContent>
    </PageLayout>
  );
};
