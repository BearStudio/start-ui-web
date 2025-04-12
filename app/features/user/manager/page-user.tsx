import { ORPCError } from '@orpc/client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AlertCircleIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { match } from 'ts-pattern';

import { authClient } from '@/lib/auth/client';
import { Role } from '@/lib/auth/permissions';
import { WithPermission } from '@/lib/auth/with-permission';
import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/page-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUser = (props: { params: { id: string } }) => {
  const user = useQuery(
    orpc.user.getById.queryOptions({ input: { id: props.params.id } })
  );

  const uiState = (() => {
    if (user.status === 'pending') return 'pending';
    if (
      user.status === 'error' &&
      user.error instanceof ORPCError &&
      user.error.code === 'NOT_FOUND'
    )
      return 'not-found';
    if (user.status === 'error') return 'error';
    return 'default';
  })();

  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={<BackButton />}
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
          {match(uiState)
            .with('pending', () => <Skeleton className="h-4 w-48" />)
            .with('not-found', 'error', () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .with('default', () => <>{user.data?.name || user.data?.email}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {match(uiState)
          .with('pending', () => <Spinner full />)
          .with('not-found', () => <PageError errorCode={404} />)
          .with('error', () => <PageError />)
          .with('default', () => (
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback
                        variant="boring"
                        name={user.data?.name ?? ''}
                      />
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <CardTitle>
                        {user.data?.name || (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{user.data?.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {user.data?.onboardedAt ? (
                      <>
                        Onboarding done on{' '}
                        {dayjs(user.data.onboardedAt).format(
                          'DD/MM/YYYY [at] HH:mm'
                        )}
                      </>
                    ) : (
                      <>Not onboarded</>
                    )}
                  </p>
                </CardContent>
              </Card>

              <UserSessions userId={props.params.id} />
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

  const sessions = useInfiniteQuery(
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
      }),
      initialPageParam: undefined,
      maxPages: 1,
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

  const items = sessions.data?.pages.flatMap((p) => p.items) ?? [];

  const uiState = (() => {
    if (sessions.status === 'pending') return 'pending';
    if (sessions.status === 'error') return 'error';
    if (!items.length) return 'empty';
    return 'default';
  })();
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
                  currentSession.data?.user.id === props.userId || !items.length
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
        {match(uiState)
          .with('pending', () => <DataListLoadingState />)
          .with('error', () => (
            <DataListErrorState retry={() => sessions.refetch()} />
          ))
          .with('empty', () => (
            <DataListEmptyState>No user sessions</DataListEmptyState>
          ))
          .with('default', () => (
            <>
              {items.map((item) => (
                <DataListRow
                  key={item.id}
                  className="max-md:flex-col max-md:py-1 max-md:[&>div]:py-1"
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
                        size="sm"
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
                    disabled={!sessions.hasNextPage}
                    onClick={() => sessions.fetchNextPage()}
                    loading={sessions.isFetchingNextPage}
                  >
                    Load more
                  </Button>
                </DataListCell>
                <DataListCell>
                  <DataListText className="text-xs text-muted-foreground">
                    Showing {items.length} of {sessions.data?.pages[0]?.total}
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
