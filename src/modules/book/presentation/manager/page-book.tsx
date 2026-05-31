import { getUiState } from '@bearstudio/ui-state';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircleIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useNavigateBack } from '@/platform/hooks/use-navigate-back';

import { BackButton } from '@/platform/components/back-button';
import { PageError } from '@/platform/components/errors/page-error';
import { ButtonLink } from '@/platform/components/ui/button-link';
import { Card, CardContent } from '@/platform/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/platform/components/ui/confirm-responsive-drawer';
import { ResponsiveIconButton } from '@/platform/components/ui/responsive-icon-button';
import { Skeleton } from '@/platform/components/ui/skeleton';
import { Spinner } from '@/platform/components/ui/spinner';

import { useCurrentScopeKey, WithPermissions } from '@/modules/auth/client';
import { isServerFnError } from '@/modules/kernel/client';
import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';

import { BookCover } from '../book-cover';
import { bookQueries } from '../queries';

export const PageBook = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['book']);
  const queryClient = useQueryClient();
  const { navigateBack } = useNavigateBack();
  const scopeKey = useCurrentScopeKey();
  const bookQuery = useQuery(
    bookQueries.getById({ id: props.params.id, scopeKey })
  );
  const deleteBookMutation = useMutation(bookQueries.deleteById());

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

  const deleteBook = async () => {
    try {
      await deleteBookMutation.mutateAsync({ id: props.params.id });
      await Promise.all([
        // Invalidate books list
        queryClient.invalidateQueries({
          queryKey: bookQueries.getAll(scopeKey),
          type: 'all',
        }),
        // Remove book from cache
        queryClient.removeQueries({
          queryKey: bookQueries.getById({ id: props.params.id, scopeKey })
            .queryKey,
        }),
      ]);

      toast.success(t('book:manager.detail.deleted'));

      // Redirect
      navigateBack();
    } catch {
      toast.error(t('book:manager.detail.deleteError'));
    }
  };

  return (
    <PageLayout>
      <PageLayoutTopBar
        startActions={<BackButton />}
        endActions={
          <>
            <WithPermissions
              permissions={[
                {
                  book: ['delete'],
                },
              ]}
            >
              <ConfirmResponsiveDrawer
                onConfirm={() => deleteBook()}
                title={t('book:manager.detail.confirmDeleteTitle', {
                  title: bookQuery.data?.title ?? '--',
                })}
                description={t('book:manager.detail.confirmDeleteDescription')}
                confirmText={t('book:manager.detail.deleteButton.label')}
                confirmVariant="destructive"
              >
                <ResponsiveIconButton
                  variant="ghost"
                  label={t('book:manager.detail.deleteButton.label')}
                  size="sm"
                >
                  <Trash2Icon />
                </ResponsiveIconButton>
              </ConfirmResponsiveDrawer>
            </WithPermissions>
            <ButtonLink
              size="sm"
              variant="secondary"
              to="/manager/books/$id/update"
              params={{ id: props.params.id }}
            >
              <PencilLineIcon />
              {t('book:manager.detail.editButton.label')}
            </ButtonLink>
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
          .match('not-found', () => <PageError type="404" />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ book }) => (
            <div className="flex flex-col gap-4 xs:flex-row">
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
