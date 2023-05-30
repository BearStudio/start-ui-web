import React from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Code,
  HStack,
  Heading,
  IconButton,
  LinkBox,
  LinkOverlay,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuPlus, LuRefreshCw } from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router-dom';

import {
  DataList,
  DataListCell,
  DataListFooter,
  DataListHeader,
  DataListRow,
} from '@/components/DataList';
import { DateAgo } from '@/components/DateAgo';
import { Page, PageContent } from '@/components/Page';
import {
  Pagination,
  PaginationButtonFirstPage,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
} from '@/components/Pagination';
import { AdminNav } from '@/features/admin/AdminNav';
import { UserStatus } from '@/features/users/UserStatus';
import { useUserList } from '@/features/users/service';

import { UserActions } from './UserActions';

export default function PageUsers() {
  const { t } = useTranslation(['users']);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = +(searchParams?.get('page') || 1);

  const pageSize = 20;
  const users = useUserList({
    page: page - 1,
    size: pageSize,
  });

  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <HStack mb="4">
          <Box flex="1">
            <Heading size="md">{t('users:list.title')}</Heading>
          </Box>
          <Box>
            <Button
              display={{ base: 'none', sm: 'flex' }}
              as={Link}
              to="/admin/users/create"
              variant="@primary"
              leftIcon={<LuPlus />}
            >
              {t('users:list.actions.createUser')}
            </Button>
            <IconButton
              display={{ base: 'flex', sm: 'none' }}
              aria-label={t('users:list.actions.createUser')}
              as={Link}
              to="/admin/users/create"
              size="sm"
              variant="@primary"
              icon={<LuPlus />}
            />
          </Box>
        </HStack>

        <DataList>
          <DataListHeader isVisible={{ base: false, md: true }}>
            <DataListCell colName="login" colWidth="2">
              {t('users:data.login.label')} / {t('users:data.email.label')}
            </DataListCell>
            <DataListCell
              colName="id"
              colWidth="4rem"
              isVisible={{ base: false, lg: true }}
            >
              {t('users:data.id.label')}
            </DataListCell>
            <DataListCell
              colName="authorities"
              isVisible={{ base: false, lg: true }}
            >
              {t('users:data.authorities.label')}
            </DataListCell>
            <DataListCell
              colName="created"
              isVisible={{ base: false, lg: true }}
            >
              {t('users:data.createdBy.label')}
            </DataListCell>
            <DataListCell
              colName="lastModified"
              isVisible={{ base: false, md: true }}
            >
              {t('users:data.modifiedBy.label')}
            </DataListCell>
            <DataListCell
              colName="status"
              colWidth={{ base: '2rem', md: '0.5' }}
              align="center"
            >
              <Box as="span" display={{ base: 'none', md: 'block' }}>
                {t('users:data.status.label')}
              </Box>
            </DataListCell>
            <DataListCell colName="actions" colWidth="4rem" align="flex-end" />
          </DataListHeader>
          {users.isError && (
            <Center p={4}>
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>
                  {t('users:feedbacks.loadingUserError.title')}
                </AlertTitle>
                <AlertDescription>
                  {t('users:feedbacks.loadingUserError.description')}
                  <Button
                    colorScheme="error"
                    variant="ghost"
                    size="sm"
                    leftIcon={<LuRefreshCw />}
                    isLoading={users.isLoadingPage}
                    onClick={() => users.refetch()}
                  >
                    {t('users:list.actions.refetch')}
                  </Button>
                </AlertDescription>
              </Alert>
            </Center>
          )}
          {users.data?.content?.map((user) => (
            <DataListRow as={LinkBox} key={user.id}>
              <DataListCell colName="login">
                <HStack maxW="100%">
                  <Avatar size="sm" name={user.login} mx="1" />
                  <Box minW="0">
                    <Text noOfLines={1} maxW="full" fontWeight="bold">
                      <LinkOverlay as={Link} to={`/admin/users/${user.login}`}>
                        {user.login}
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
              <DataListCell colName="id">
                <Code maxW="full" fontSize="xs">
                  {user.id}
                </Code>
              </DataListCell>
              <DataListCell colName="authorities">
                <Wrap>
                  {user.authorities?.map((authority) => (
                    <WrapItem key={authority}>
                      <Badge size="sm">{authority}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </DataListCell>
              <DataListCell
                colName="created"
                fontSize="sm"
                position="relative"
                pointerEvents="none"
              >
                <Text noOfLines={1} maxW="full">
                  {user.createdBy}
                </Text>
                {!!user.createdDate && (
                  <Text
                    noOfLines={1}
                    maxW="full"
                    pointerEvents="auto"
                    color="gray.600"
                    _dark={{ color: 'gray.300' }}
                  >
                    <DateAgo date={user.createdDate} />
                  </Text>
                )}
              </DataListCell>
              <DataListCell
                colName="lastModified"
                fontSize="sm"
                position="relative"
                pointerEvents="none"
              >
                <Text noOfLines={1} maxW="full">
                  {user.lastModifiedBy}
                </Text>
                {!!user.lastModifiedDate && (
                  <Text
                    noOfLines={1}
                    maxW="full"
                    pointerEvents="auto"
                    color="gray.600"
                    _dark={{ color: 'gray.300' }}
                  >
                    <DateAgo position="relative" date={user.lastModifiedDate} />
                  </Text>
                )}
              </DataListCell>
              <DataListCell colName="status">
                <UserStatus isActivated={user.activated} />
              </DataListCell>
              <DataListCell colName="actions">
                <UserActions user={user} />
              </DataListCell>
            </DataListRow>
          ))}
          <DataListFooter>
            <Pagination
              isLoadingPage={users.isLoadingPage}
              setPage={(newPage) =>
                setSearchParams({ page: newPage.toString() })
              }
              page={page}
              pageSize={pageSize}
              totalItems={users.data?.totalItems}
            >
              <PaginationButtonFirstPage />
              <PaginationButtonPrevPage />
              <PaginationInfo flex="1" />
              <PaginationButtonNextPage />
              <PaginationButtonLastPage />
            </Pagination>
          </DataListFooter>
        </DataList>
      </PageContent>
    </Page>
  );
}
