import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/platform/components/back-button';
import { PageError } from '@/platform/components/errors/page-error';
import { Card, CardContent } from '@/platform/components/ui/card';
import { Separator } from '@/platform/components/ui/separator';
import { Skeleton } from '@/platform/components/ui/skeleton';
import { Spinner } from '@/platform/components/ui/spinner';

import { useCurrentScopeKey } from '@/modules/auth/client';
import { isServerFnError } from '@/modules/kernel/client';
import {
  AppPageLayout as PageLayout,
  AppPageLayoutContent as PageLayoutContent,
  AppPageLayoutTopBar as PageLayoutTopBar,
  AppPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';

import { BookCover } from '../book-cover';
import { bookQueries } from '../queries';

export const PageBook = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['book']);
  const scopeKey = useCurrentScopeKey();
  const bookQuery = useQuery(
    bookQueries.getById({ id: props.params.id, scopeKey })
  );

  const ui = getUiState((set) => {
    if (bookQuery.status === 'pending') return set('pending');
    if (
      bookQuery.status === 'error' &&
      isServerFnError(bookQuery.error) &&
      bookQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (bookQuery.status === 'error') return set('error');
    return set('default', { book: bookQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        startActions={
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
            .match('default', ({ book }) => <>{book.title}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError type="404" />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ book }) => (
            <div className="flex flex-col gap-8 xs:flex-row">
              <div className="flex-2">
                <Card className="py-1">
                  <CardContent>
                    <dl className="flex flex-col divide-y text-sm">
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('book:common.title.label')}
                        </dt>
                        <dd className="flex-1">{book.title}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('book:common.author.label')}
                        </dt>
                        <dd className="flex-1">{book.author}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('book:common.genre.label')}
                        </dt>
                        <dd className="flex-1">{book.genre?.name}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('book:common.publisher.label')}
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
