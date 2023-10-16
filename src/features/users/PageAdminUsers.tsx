import React from 'react';

import {
  Avatar,
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import { LuPlus } from 'react-icons/lu';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListFooter,
  DataListLoadingState,
  DataListRow,
} from '@/components/DataList';
import { DateAgo } from '@/components/DateAgo';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { ADMIN_PATH } from '@/features/admin/constants';
import { AdminNav } from '@/features/management/ManagementNav';
import { UserStatus } from '@/features/users/UserStatus';
import { trpc } from '@/lib/trpc/client';

import { AdminUserActions } from './AdminUserActions';

export default function PageAdminUsers() {
  const { t } = useTranslation(['users']);
  const account = trpc.account.get.useQuery();

  const users = trpc.users.getAll.useInfiniteQuery(
    { limit: 50 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <AdminLayoutPage containerMaxWidth="container.xl" nav={<AdminNav />}>
      <AdminLayoutPageContent>
        <Stack spacing={4}>
          <HStack spacing={4}>
            <Heading size="md" flex="1">
              {t('users:list.title')}
            </Heading>

            <ResponsiveIconButton
              as={Link}
              href={`${ADMIN_PATH}/management/users/create`}
              variant="@primary"
              icon={<LuPlus />}
            >
              {t('users:list.actions.createUser')}
            </ResponsiveIconButton>
          </HStack>

          <DataList>
            {users.isLoading && <DataListLoadingState />}
            {users.isError && (
              <DataListErrorState
                title={t('users:feedbacks.loadingUserError.title')}
                retry={() => users.refetch()}
              />
            )}
            {users.isSuccess &&
              !users.data.pages.flatMap((p) => p.items).length && (
                <DataListEmptyState />
              )}
            {users.data?.pages
              .flatMap((p) => p.items)
              .map((user) => (
                <DataListRow as={LinkBox} key={user.id}>
                  <DataListCell colName="login" colWidth="2">
                    <HStack maxW="100%">
                      <Avatar size="sm" name={user.email ?? ''} mx="1" />
                      <Box minW="0">
                        <Text noOfLines={1} maxW="full" fontWeight="bold">
                          {user.id === account.data?.id && (
                            <Badge
                              size="xs"
                              colorScheme="success"
                              mr="2"
                              textTransform="uppercase"
                            >
                              {t('users:you')}
                            </Badge>
                          )}
                          <LinkOverlay
                            as={Link}
                            href={`${ADMIN_PATH}/management/users/${user.id}`}
                          >
                            {user.name ?? user.email}
                          </LinkOverlay>
                        </Text>
                        <Text
                          noOfLines={1}
                          maxW="full"
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.300' }}
                        >
                          {user.email}
                        </Text>
                      </Box>
                    </HStack>
                  </DataListCell>
                  <DataListCell colName="authorities" colWidth="0.5">
                    {user.authorizations
                      .filter((a) => a !== 'APP')
                      .map((authorization) => (
                        <Badge
                          size="sm"
                          colorScheme="warning"
                          key={authorization}
                        >
                          {t(
                            `users:data.authorizations.options.${authorization}`
                          )}
                        </Badge>
                      ))}
                  </DataListCell>
                  <DataListCell
                    colName="created"
                    fontSize="sm"
                    position="relative"
                    pointerEvents="none"
                    isVisible={{ base: false, lg: true }}
                  >
                    <Text
                      noOfLines={2}
                      maxW="full"
                      pointerEvents="auto"
                      color="gray.600"
                      _dark={{ color: 'gray.300' }}
                    >
                      Created <DateAgo date={user.createdAt} />
                    </Text>
                  </DataListCell>
                  <DataListCell
                    colName="status"
                    colWidth={{ base: '2rem', md: '0.5' }}
                    align="center"
                  >
                    <UserStatus
                      isActivated={user.accountStatus === 'ENABLED'}
                    />
                  </DataListCell>
                  <DataListCell
                    colName="actions"
                    colWidth="4rem"
                    align="flex-end"
                  >
                    <AdminUserActions user={user} />
                  </DataListCell>
                </DataListRow>
              ))}
            {users.isSuccess && (
              <DataListFooter gap={3}>
                <Button
                  size="sm"
                  onClick={() => users.fetchNextPage()}
                  isLoading={users.isFetchingNextPage}
                  isDisabled={!users.hasNextPage}
                >
                  {t('users:list.loadMore.button')}
                </Button>
                <Box flex={1}>
                  {users.isSuccess && !!users.data.pages[0]?.total && (
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      _dark={{ color: 'gray.300' }}
                    >
                      <Trans
                        i18nKey="users:list.loadMore.display"
                        t={t}
                        values={{
                          loaded: users.data.pages.flatMap((p) => p.items)
                            .length,
                          total: users.data.pages[0].total,
                        }}
                      />
                    </Text>
                  )}
                </Box>
              </DataListFooter>
            )}
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
