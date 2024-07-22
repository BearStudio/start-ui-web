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
  chakra,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { SubmitHandler } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { LuChevronDown, LuPlus } from 'react-icons/lu';
import { z } from 'zod';

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
import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';
import { FormPopover } from '@/components/FormPopover';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SearchInput } from '@/components/SearchInput';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { AdminNav } from '@/features/management/ManagementNav';
import { UserStatus } from '@/features/users/UserStatus';
import { ROUTES_USERS } from '@/features/users/routes';
import { trpc } from '@/lib/trpc/client';

import { AdminUserActions } from './AdminUserActions';

type StatusFormSchema = z.infer<ReturnType<typeof zStatusFormSchema>>;
const zStatusFormSchema = () =>
  z.object({
    status: z.string().nullable(),
  });

export default function PageAdminUsers() {
  const { t } = useTranslation(['users', 'common']);
  const [searchTerm, setSearchTerm] = useQueryState('s', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', {
    defaultValue: '',
  });

  const handleSubmit: SubmitHandler<StatusFormSchema> = (values) => {
    setStatus(values.status);
  };

  const account = trpc.account.get.useQuery();

  const users = trpc.users.getAll.useInfiniteQuery(
    { searchTerm, status },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const options = ['ENABLED', 'DISABLED'].map((v) => ({
    label:
      v === 'DISABLED'
        ? t('users:data.status.deactivated')
        : t('users:data.status.activated'),
    value: v,
  }));

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
              <FormPopover
                value={{
                  status: status,
                }}
                onSubmit={handleSubmit}
                schema={zStatusFormSchema()}
                renderTrigger={({ onClick }) => (
                  <Button
                    onClick={onClick}
                    size="sm"
                    variant={status ? '@secondary' : undefined}
                    rightIcon={<LuChevronDown />}
                  >
                    {t('users:list.status')}
                    {status && (
                      <> : {options.find((o) => o.value === status)?.label}</>
                    )}
                  </Button>
                )}
                renderFooterSecondaryAction={({ onClose }) => (
                  <Button
                    variant="link"
                    type="reset"
                    onClick={() => {
                      setStatus(null);
                      onClose();
                    }}
                    me="auto"
                  >
                    {t('common:clear')}
                  </Button>
                )}
              >
                {(form) => (
                  <FormField>
                    <FormFieldLabel>{t('users:list.status')}</FormFieldLabel>
                    <FormFieldController
                      control={form.control}
                      type="select"
                      name="status"
                      size="sm"
                      options={options}
                    />
                  </FormField>
                )}
              </FormPopover>
            </Flex>
            <ResponsiveIconButton
              as={Link}
              href={ROUTES_USERS.admin.create()}
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
                        as={Link}
                        href={ROUTES_USERS.admin.user({ id: user.id })}
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
                          <chakra.span noOfLines={1}>
                            {t(
                              `users:data.authorizations.options.${authorization}`
                            )}
                          </chakra.span>
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
