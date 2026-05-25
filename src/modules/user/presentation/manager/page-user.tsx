import { getUiState } from '@bearstudio/ui-state';
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

import { useNavigateBack } from '@/platform/hooks/use-navigate-back';

import { BackButton } from '@/platform/components/back-button';
import { PageError } from '@/platform/components/errors/page-error';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/platform/components/ui/avatar';
import { Badge } from '@/platform/components/ui/badge';
import { Button } from '@/platform/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/platform/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/platform/components/ui/confirm-responsive-drawer';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/platform/components/ui/datalist';
import { ResponsiveIconButton } from '@/platform/components/ui/responsive-icon-button';
import { Skeleton } from '@/platform/components/ui/skeleton';
import { Spinner } from '@/platform/components/ui/spinner';

import {
  useAuthSession,
  useCurrentScopeKey,
  WithPermissions,
} from '@/modules/auth/client';
import { isServerFnError } from '@/modules/kernel/client';
import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/modules/shell/presentation';

import { userQueries } from '../queries';

export const PageUser = (props: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const { navigateBack } = useNavigateBack();
  const session = useAuthSession();
  const { t } = useTranslation(['user']);
  const scopeKey = useCurrentScopeKey();
  const userQuery = useQuery(
    userQueries.getById({ id: props.params.id, scopeKey })
  );

  const deleteUserMutation = useMutation(userQueries.deleteById());

  const deleteUser = async () => {
    try {
      await deleteUserMutation.mutateAsync({ id: props.params.id });
      await Promise.all([
        // Invalidate users list
        queryClient.invalidateQueries({
          queryKey: userQueries.getAll(scopeKey),
          type: 'all',
        }),
        // Remove user from cache
        queryClient.removeQueries({
          queryKey: userQueries.getById({ id: props.params.id, scopeKey })
            .queryKey,
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
      isServerFnError(userQuery.error) &&
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
                    <WithPermissions permissions={[{ user: ['update'] }]}>
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
  const scopeKey = useCurrentScopeKey();
  const sessionsQuery = useInfiniteQuery(
    userQueries.getUserSessionsInfinite({
      scopeKey,
      userId: props.userId,
      limit: 5,
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
                      {t('user:manager.detail.session', { id: item.id })}
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
                        sessionId={item.id}
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
  const currentSession = useAuthSession();
  const scopeKey = useCurrentScopeKey();
  const { t } = useTranslation(['user']);
  const revokeAllSessions = useMutation({
    ...userQueries.revokeUserSessions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userQueries.getUserSessions(scopeKey),
      });
    },
    onError: () => {
      toast.error(t('user:manager.detail.revokeAllError'));
    },
  });

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

const RevokeSessionButton = (props: { userId: string; sessionId: string }) => {
  const queryClient = useQueryClient();
  const currentSession = useAuthSession();
  const scopeKey = useCurrentScopeKey();
  const { t } = useTranslation(['user']);
  const revokeSession = useMutation({
    ...userQueries.revokeUserSession(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userQueries.getUserSessions(scopeKey),
      });
    },
    onError: () => {
      toast.error(t('user:manager.detail.revokeError'));
    },
  });
  return (
    <Button
      size="xs"
      variant="secondary"
      disabled={currentSession.data?.session.id === props.sessionId}
      loading={revokeSession.isPending}
      onClick={() => {
        revokeSession.mutate({
          id: props.userId,
          sessionId: props.sessionId,
        });
      }}
    >
      {t('user:manager.detail.revokeSession')}
    </Button>
  );
};
