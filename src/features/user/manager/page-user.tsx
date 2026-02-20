import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { AlertCircleIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { WithPermissions } from '@/features/auth/with-permission';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUser = (props: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const { navigateBack } = useNavigateBack();
  const session = authClient.useSession();
  const { t } = useTranslation(['user']);
  const userQuery = useQuery(
    orpc.user.getById.queryOptions({
      input: { id: props.params.id },
    })
  );

  const deleteUser = async () => {
    try {
      await orpc.user.deleteById.call({ id: props.params.id });
      await Promise.all([
        // Invalidate users list
        queryClient.invalidateQueries({
          queryKey: orpc.user.getAll.key(),
          type: 'all',
        }),
        // Remove user from cache
        queryClient.removeQueries({
          queryKey: orpc.user.getById.key({ input: { id: props.params.id } }),
        }),
      ]);

      toast.success(t('user:manager.detail.userDeleted'));

      // Redirect
      navigateBack();
    } catch {
      toast.error(t('user:manager.detail.deleteError'));
    }
  };

  const ui = getUiState((set) => {
    if (userQuery.status === 'pending') return set('pending');
    if (
      userQuery.status === 'error' &&
      userQuery.error instanceof ORPCError &&
      userQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (userQuery.status === 'error') return set('error');

    return set('default', { user: userQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        startActions={<BackButton />}
        endActions={
          <>
            {session.data?.user.id !== props.params.id && (
              <WithPermissions
                permissions={[
                  {
                    user: ['delete'],
                  },
                ]}
              >
                <ConfirmResponsiveDrawer
                  onConfirm={() => deleteUser()}
                  title={t('user:manager.detail.confirmDeleteTitle', {
                    user: userQuery.data?.name ?? userQuery.data?.email ?? '--',
                  })}
                  description={t(
                    'user:manager.detail.confirmDeleteDescription'
                  )}
                  confirmText={t('user:manager.detail.deleteButton.label')}
                  confirmVariant="destructive"
                >
                  <ResponsiveIconButton
                    variant="ghost"
                    label={t('user:manager.detail.deleteButton.label')}
                    size="sm"
                  >
                    <Trash2Icon />
                  </ResponsiveIconButton>
                </ConfirmResponsiveDrawer>
              </WithPermissions>
            )}
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match(['not-found', 'error'], () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ user }) => <>{user.name || user.email}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError type="404" />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ user }) => (
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <Card className="relative flex-1">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? ''}
                      />
                      <AvatarFallback variant="boring" name={user.name ?? ''} />
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <CardTitle>
                        {user.name || (
                          <span className="text-xs text-muted-foreground">
                            {t('user:common.name.notAvailable')}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <WithPermissions permissions={[{ user: ['set-role'] }]}>
                      <Link
                        to="/manager/users/$id/update"
                        params={props.params}
                        className="-m-2 self-start"
                      >
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          render={<span />}
                          nativeButton={false}
                        >
                          <PencilLineIcon />
                          <span className="sr-only">
                            {t('user:manager.detail.editUser')}
                          </span>
                        </Button>
                        <span className="absolute inset-0" />
                      </Link>
                    </WithPermissions>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {user.role ?? '-'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {user.onboardedAt ? (
                        <>
                          {t('user:common.onboardingStatus.onboardedAt', {
                            time: dayjs(user.onboardedAt).format(
                              'DD/MM/YYYY [at] HH:mm'
                            ),
                          })}
                        </>
                      ) : (
                        <>{t('user:common.onboardingStatus.notOnboarded')}</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex min-w-0 flex-2 flex-col">
                <WithPermissions permissions={[{ session: ['list'] }]}>
                  <UserSessions userId={props.params.id} />
                </WithPermissions>
              </div>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};

const UserSessions = (props: { userId: string }) => {
  const { t } = useTranslation(['user']);
  const sessionsQuery = useInfiniteQuery(
    orpc.user.getUserSessions.infiniteOptions({
      input: (cursor: string | undefined) => ({
        userId: props.userId,
        cursor,
        limit: 5,
      }),
      maxPages: 10,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const ui = getUiState((set) => {
    if (sessionsQuery.status === 'pending') return set('pending');
    if (sessionsQuery.status === 'error') return set('error');

    const items = sessionsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', {
      items,
    });
  });

  return (
    <WithPermissions permissions={[{ session: ['list'] }]}>
      <DataList>
        <DataListRow>
          <DataListCell>
            <h2 className="text-sm font-medium">
              {t('user:manager.detail.userSessions')}
            </h2>
          </DataListCell>

          <WithPermissions permissions={[{ session: ['revoke'] }]}>
            <DataListCell className="flex-none">
              {ui.when('default', () => (
                <RevokeAllSessionsButton userId={props.userId} />
              ))}
            </DataListCell>
          </WithPermissions>
        </DataListRow>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => sessionsQuery.refetch()} />
          ))
          .match('empty', () => (
            <DataListEmptyState className="min-h-20">
              {t('user:manager.detail.noSessions')}
            </DataListEmptyState>
          ))
          .match('default', ({ items }) => (
            <>
              {items.map((item) => (
                <DataListRow
                  key={item.id}
                  className="max-md:flex-col max-md:py-2 max-md:[&>div]:py-1"
                >
                  <DataListCell>
                    <DataListText>
                      {t('user:manager.detail.session', { token: item.token })}
                    </DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-muted-foreground">
                      {t('user:manager.detail.sessionUpdated', {
                        time: dayjs(item.updatedAt).fromNow(),
                      })}
                    </DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-muted-foreground">
                      {t('user:manager.detail.sessionExpires', {
                        time: dayjs().to(item.expiresAt),
                      })}
                    </DataListText>
                  </DataListCell>
                  <WithPermissions permissions={[{ session: ['revoke'] }]}>
                    <DataListCell className="flex-none">
                      <RevokeSessionButton
                        userId={props.userId}
                        sessionToken={item.token}
                      />
                    </DataListCell>
                  </WithPermissions>
                </DataListRow>
              ))}
              <DataListRow>
                <DataListCell className="flex-none">
                  <Button
                    size="xs"
                    variant="secondary"
                    disabled={!sessionsQuery.hasNextPage}
                    onClick={() => sessionsQuery.fetchNextPage()}
                    loading={sessionsQuery.isFetchingNextPage}
                  >
                    {t('user:manager.list.loadMore')}
                  </Button>
                </DataListCell>
                <DataListCell>
                  <DataListText className="text-xs text-muted-foreground">
                    {t('user:manager.list.showing', {
                      count: items.length,
                      total: sessionsQuery.data?.pages[0]?.total,
                    })}
                  </DataListText>
                </DataListCell>
              </DataListRow>
            </>
          ))
          .exhaustive()}
      </DataList>
    </WithPermissions>
  );
};

const RevokeAllSessionsButton = (props: { userId: string }) => {
  const queryClient = useQueryClient();
  const currentSession = authClient.useSession();
  const { t } = useTranslation(['user']);
  const revokeAllSessions = useMutation(
    orpc.user.revokeUserSessions.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.user.getUserSessions.key({
            input: { userId: props.userId },
            type: 'infinite',
          }),
        });
      },
      onError: () => {
        toast.error(t('user:manager.detail.revokeAllError'));
      },
    })
  );

  return (
    <Button
      size="xs"
      variant="secondary"
      disabled={currentSession.data?.user.id === props.userId}
      loading={revokeAllSessions.isPending}
      onClick={() => {
        revokeAllSessions.mutate({
          id: props.userId,
        });
      }}
    >
      {t('user:manager.detail.revokeAllSessions')}
    </Button>
  );
};

const RevokeSessionButton = (props: {
  userId: string;
  sessionToken: string;
}) => {
  const queryClient = useQueryClient();
  const currentSession = authClient.useSession();
  const { t } = useTranslation(['user']);
  const revokeSession = useMutation(
    orpc.user.revokeUserSession.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.user.getUserSessions.key({
            input: { userId: props.userId },
            type: 'infinite',
          }),
        });
      },
      onError: () => {
        toast.error(t('user:manager.detail.revokeError'));
      },
    })
  );
  return (
    <Button
      size="xs"
      variant="secondary"
      disabled={currentSession.data?.session.token === props.sessionToken}
      loading={revokeSession.isPending}
      onClick={() => {
        revokeSession.mutate({
          id: props.userId,
          sessionToken: props.sessionToken,
        });
      }}
    >
      {t('user:manager.detail.revokeSession')}
    </Button>
  );
};
