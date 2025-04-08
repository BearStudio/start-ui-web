import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { Skeleton } from '@/components/ui/skeleton';

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

  const getUiState = () => {
    if (repository.status === 'pending') return 'pending';
    if (repository.status === 'error') return 'error';
    return 'default';
  };

  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={
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
        }
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
          {match(getUiState())
            .with('pending', () => <Skeleton className="h-4 w-48" />)
            .with('error', () => 'ERROR') // TODO translation
            .with('default', () => <>{repository.data?.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {match(getUiState())
          .with('pending', () => <>Loading...</>) // TODO Design
          .with('error', () => <PageError />)
          .with('default', () => <>{repository.data?.name}</>)
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
