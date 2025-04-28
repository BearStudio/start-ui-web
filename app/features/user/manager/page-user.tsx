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
import { match } from 'ts-pattern';

import { authClient } from '@/lib/auth/client';
import { Role } from '@/lib/auth/permissions';
import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/page-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

import { WithPermission } from '@/features/auth/with-permission';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUser = (props: { params: { id: string } }) => {
  const userQuery = useQuery(
    orpc.user.getById.queryOptions({ input: { id: props.params.id } })
  );

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
        backButton={<BackButton />}
        actions={
          <>
            <ResponsiveIconButton variant="ghost" label="Delete" size="sm">
              <Trash2Icon />
            </ResponsiveIconButton>
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {match(ui.state)
            .with(ui.with('pending'), () => <Skeleton className="h-4 w-48" />)
            .with(ui.with('not-found'), ui.with('error'), () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .with(ui.with('default'), ({ user }) => (
              <>{user.name || user.email}</>
            ))
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {match(ui.state)
          .with(ui.with('pending'), () => <Spinner full />)
          .with(ui.with('not-found'), () => <PageError errorCode={404} />)
          .with(ui.with('error'), () => <PageError />)
          .with(ui.with('default'), ({ user }) => (
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <Card className="relative flex-1">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback variant="boring" name={user.name ?? ''} />
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <CardTitle>
                        {user.name || (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <WithPermission permission={{ user: ['set-role'] }}>
                      <Link
                        to="/manager/users/$id/update"
                        params={props.params}
                        className="-m-2 self-start"
                      >
                        <Button size="icon-sm" variant="ghost" asChild>
                          <span>
                            <PencilLineIcon />
                            <span className="sr-only"></span>
                          </span>
                        </Button>
                        <span className="absolute inset-0" />
                      </Link>
                    </WithPermission>
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
                          Onboarded on{' '}
                          {dayjs(user.onboardedAt).format(
                            'DD/MM/YYYY [at] HH:mm'
                          )}
                        </>
                      ) : (
                        <>Not onboarded</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-2 flex-col">
                <UserSessions userId={props.params.id} />
              </div>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};

const UserSessions = (props: { userId: string }) => {
  const queryClient = useQueryClient();
  const currentSession = authClient.useSession();

  const sessionsQuery = useInfiniteQuery(
    orpc.user.getUserSessions.infiniteOptions({
      enabled: currentSession.data?.user.role
        ? authClient.admin.checkRolePermission({
            role: currentSession.data.user.role as Role,
            permission: {
              session: ['list'],
            },
          })
        : false,
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

  const revokeAllSessions = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await authClient.admin.revokeUserSessions({
        userId,
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      await queryClient.invalidateQueries({
        queryKey: orpc.user.getUserSessions.key({
          input: { userId: props.userId },
          type: 'infinite',
        }),
      });
      return response.data;
    },
  });

  const revokeSession = useMutation({
    mutationFn: async ({ sessionToken }: { sessionToken: string }) => {
      const response = await authClient.admin.revokeUserSession({
        sessionToken,
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      await queryClient.invalidateQueries({
        queryKey: orpc.user.getUserSessions.key({
          input: { userId: props.userId },
          type: 'infinite',
        }),
      });
      return response.data;
    },
  });

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
    <WithPermission permission={{ session: ['list'] }}>
      <DataList>
        <DataListRow>
          <DataListCell>
            <h2 className="text-sm font-medium">User Sessions</h2>
          </DataListCell>

          <WithPermission permission={{ session: ['revoke'] }}>
            <DataListCell className="flex-none">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={
                  currentSession.data?.user.id === props.userId ||
                  ui.is('empty')
                }
                loading={revokeAllSessions.isPending}
                onClick={() => {
                  revokeAllSessions.mutate({
                    userId: props.userId,
                  });
                }}
              >
                Revoke all
              </Button>
            </DataListCell>
          </WithPermission>
        </DataListRow>

        {match(ui.state)
          .with(ui.with('pending'), () => <DataListLoadingState />)
          .with(ui.with('error'), () => (
            <DataListErrorState retry={() => sessionsQuery.refetch()} />
          ))
          .with(ui.with('empty'), () => (
            <DataListEmptyState className="min-h-20">
              No user sessions
            </DataListEmptyState>
          ))
          .with(ui.with('default'), ({ items }) => (
            <>
              {items.map((item) => (
                <DataListRow
                  key={item.id}
                  className="max-md:flex-col max-md:py-2 max-md:[&>div]:py-1"
                >
                  <DataListCell>
                    <DataListText>Session {item.token}</DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-muted-foreground">
                      Updated {dayjs(item.updatedAt).fromNow()}
                    </DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-muted-foreground">
                      Expires {dayjs().to(item.expiresAt)}
                    </DataListText>
                  </DataListCell>
                  <WithPermission permission={{ session: ['revoke'] }}>
                    <DataListCell className="flex-none">
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        disabled={
                          currentSession.data?.session.token === item.token
                        }
                        loading={revokeSession.isPending}
                        onClick={() => {
                          revokeSession.mutate({
                            sessionToken: item.token,
                          });
                        }}
                      >
                        Revoke
                      </Button>
                    </DataListCell>
                  </WithPermission>
                </DataListRow>
              ))}
              <DataListRow>
                <DataListCell className="flex-none">
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    disabled={!sessionsQuery.hasNextPage}
                    onClick={() => sessionsQuery.fetchNextPage()}
                    loading={sessionsQuery.isFetchingNextPage}
                  >
                    Load more
                  </Button>
                </DataListCell>
                <DataListCell>
                  <DataListText className="text-xs text-muted-foreground">
                    Showing {items.length} of{' '}
                    {sessionsQuery.data?.pages[0]?.total}
                  </DataListText>
                </DataListCell>
              </DataListRow>
            </>
          ))
          .exhaustive()}
      </DataList>
    </WithPermission>
  );
};
