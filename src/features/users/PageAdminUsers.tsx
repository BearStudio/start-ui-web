import React from 'react';

import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { SearchInput } from '@/components/SearchInput';
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
  const searchParamsUpdater = useSearchParamsUpdater();
  const searchTerm = searchParams.get('s') ?? '';
  const account = trpc.account.get.useQuery();

  const users = trpc.users.getAll.useInfiniteQuery(
    { searchTerm },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <AdminLayoutPage containerMaxWidth="container.xl" nav={<AdminNav />}>
      <AdminLayoutPageContent>
        <Stack spacing={4}>
          <HStack spacing={4} alignItems={{ base: 'end', md: 'center' }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              rowGap={2}
              columnGap={4}
              alignItems={{ base: 'start', md: 'center' }}
              flex={1}
            >
              <Heading flex="none" size="md">
                {t('users:list.title')}
              </Heading>
              <SearchInput
                size="sm"
                value={searchTerm}
                onChange={(value) => searchParamsUpdater({ s: value || null })}
                maxW={{ base: 'none', md: '20rem' }}
              />
            </Flex>
            <ResponsiveIconButton
              as={Link}
              href={`${ADMIN_PATH}/management/users/create`}
              variant="@primary"
              size="sm"
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
                <DataListEmptyState searchTerm={searchTerm} />
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
                            <Tag
                              size="sm"
                              fontSize="2xs"
                              colorScheme="success"
                              me="2"
                              textTransform="uppercase"
                              lineHeight={1}
                              px={1.5}
                              py={0}
                            >
                              {t('users:you')}
                            </Tag>
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
                  <DataListCell
                    colName="authorities"
                    colWidth="0.5"
                    isVisible={{ base: false, md: true }}
                  >
                    {user.authorizations
                      .filter((a) => a !== 'APP')
                      .map((authorization) => (
                        <Tag
                          size="sm"
                          colorScheme="warning"
                          key={authorization}
                          lineHeight={1}
                        >
                          {t(
                            `users:data.authorizations.options.${authorization}`
                          )}
                        </Tag>
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
                      <Trans
                        i18nKey="users:data.createdAt.ago"
                        t={t}
                        components={{
                          dateAgo: <DateAgo date={user.createdAt} />,
                        }}
                      />
                    </Text>
                  </DataListCell>
                  <DataListCell
                    colName="status"
                    colWidth={{ base: '3rem', lg: '10rem' }}
                    align="center"
                  >
                    <UserStatus
                      isActivated={user.accountStatus === 'ENABLED'}
                      showLabelBreakpoint="lg"
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
