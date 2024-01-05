import React from 'react';

import {
  Avatar,
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
import { useQueryState } from 'nuqs';
import { Trans, useTranslation } from 'react-i18next';
import { LuPlus } from 'react-icons/lu';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/DataList';
import { DateAgo } from '@/components/DateAgo';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SearchInput } from '@/components/SearchInput';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { AdminNav } from '@/features/management/ManagementNav';
import { UserStatus } from '@/features/users/UserStatus';
import { trpc } from '@/lib/trpc/client';

import { AdminUserActions } from './AdminUserActions';

export default function PageAdminUsers() {
  const { t } = useTranslation(['users']);
  const [searchTerm, setSearchTerm] = useQueryState('s', { defaultValue: '' });

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
                onChange={(value) => setSearchTerm(value || null)}
                maxW={{ base: 'none', md: '20rem' }}
              />
            </Flex>
            <ResponsiveIconButton
              as={LinkAdmin}
              href="/management/users/create"
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
                <DataListRow as={LinkBox} key={user.id} withHover>
                  <DataListCell w="auto">
                    <Avatar size="sm" name={user.email ?? ''} />
                  </DataListCell>
                  <DataListCell flex={2}>
                    <DataListText fontWeight="bold">
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
                        as={LinkAdmin}
                        href={`/management/users/${user.id}`}
                      >
                        {user.name ?? user.email}
                      </LinkOverlay>
                    </DataListText>
                    <DataListText color="text-dimmed">
                      {user.email}
                    </DataListText>
                  </DataListCell>
                  <DataListCell w="10ch" display={{ base: 'none', sm: 'flex' }}>
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
                    pointerEvents="none"
                    display={{ base: 'none', md: 'flex' }}
                  >
                    <DataListText
                      noOfLines={2}
                      pointerEvents="auto"
                      color="text-dimmed"
                    >
                      <Trans
                        i18nKey="users:data.createdAt.ago"
                        t={t}
                        components={{
                          dateAgo: <DateAgo date={user.createdAt} />,
                        }}
                      />
                    </DataListText>
                  </DataListCell>
                  <DataListCell w={{ base: 'auto', md: '14ch' }} align="center">
                    <UserStatus
                      isActivated={user.accountStatus === 'ENABLED'}
                      showLabelBreakpoint="md"
                    />
                  </DataListCell>
                  <DataListCell w="auto">
                    <AdminUserActions user={user} />
                  </DataListCell>
                </DataListRow>
              ))}
            {users.isSuccess && (
              <DataListRow mt="auto">
                <DataListCell w="auto">
                  <Button
                    size="sm"
                    onClick={() => users.fetchNextPage()}
                    isLoading={users.isFetchingNextPage}
                    isDisabled={!users.hasNextPage}
                  >
                    {t('users:list.loadMore.button')}
                  </Button>
                </DataListCell>
                <DataListCell>
                  {users.isSuccess && !!users.data.pages[0]?.total && (
                    <Text fontSize="xs" color="text-dimmed">
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
                </DataListCell>
              </DataListRow>
            )}
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
