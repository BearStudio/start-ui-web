import React from 'react';

import {
  Avatar,
  Badge,
  Box,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
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
import {
  Pagination,
  PaginationButtonFirstPage,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
} from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { ADMIN_PATH } from '@/features/admin/constants';
import { AdminNav } from '@/features/management/ManagementNav';
import { UserStatus } from '@/features/users/UserStatus';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

import { AdminUserActions } from './AdminUserActions';

export default function PageAdminUsers() {
  const { t } = useTranslation(['users']);
  const searchParams = useSearchParams();
  const setSearchParams = useSearchParamsUpdater();
  const page = +(searchParams?.get('page') || 1);
  const account = trpc.account.get.useQuery();

  const pageSize = 20;
  const users = trpc.users.getAll.useQuery({
    page,
    size: pageSize,
  });

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
            {users.isSuccess && !users.data.items.length && (
              <DataListEmptyState />
            )}
            {users.data?.items.map((user) => (
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
                  {user.roles
                    .filter((r) => r !== 'USER')
                    .map((role) => (
                      <Badge size="sm" colorScheme="warning" key={role}>
                        {t(`users:data.roles.options.${role}`)}
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
                  <UserStatus isActivated={user.accountStatus === 'ENABLED'} />
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
            <DataListFooter>
              <Pagination
                isLoadingPage={users.isFetching}
                setPage={(newPage) =>
                  setSearchParams({ page: newPage.toString() })
                }
                page={page}
                pageSize={pageSize}
                totalItems={users.data?.total}
              >
                <PaginationButtonFirstPage />
                <PaginationButtonPrevPage />
                <PaginationInfo flex="1" />
                <PaginationButtonNextPage />
                <PaginationButtonLastPage />
              </Pagination>
            </DataListFooter>
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
