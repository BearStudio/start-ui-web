import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { AlertCircleIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { BookCover } from '@/features/book/book-cover';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageBook = (props: { params: { id: string } }) => {
  const bookQuery = useQuery(
    orpc.book.getById.queryOptions({ input: { id: props.params.id } })
  );

  const ui = getUiState((set) => {
    if (bookQuery.status === 'pending') return set('pending');
    if (
      bookQuery.status === 'error' &&
      bookQuery.error instanceof ORPCError &&
      bookQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (bookQuery.status === 'error') return set('error');
    return set('default', { book: bookQuery.data });
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
            <Button asChild size="sm" variant="secondary">
              <Link
                to="/manager/books/$id/update"
                params={{ id: props.params.id }}
              >
                <PencilLineIcon />
                Edit
              </Link>
            </Button>
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match(['not-found', 'error'], () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ book }) => (
              <>
                {book.title} - {book.author}
              </>
            ))
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError error="404" />)
          .match('error', () => <PageError />)
          .match('default', ({ book }) => (
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card className="py-1">
                  <CardContent>
                    <dl className="flex flex-col divide-y text-sm">
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Title
                        </dt>
                        <dd className="flex-1">{book.title}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Author
                        </dt>
                        <dd className="flex-1">{book.author}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Genre
                        </dt>
                        <dd className="flex-1">{book.genre?.name}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          Publisher
                        </dt>
                        <dd className="flex-1">{book.publisher}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              <div
                aria-hidden
                className="mx-auto w-full max-w-64 min-w-48 flex-1"
              >
                <BookCover book={book} />
              </div>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
