import React from 'react';

import {
  Code,
  Badge,
  Wrap,
  WrapItem,
  HStack,
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  MenuItem,
  Heading,
  Portal,
  Button,
  IconButton,
  Text,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
import { useQueryClient } from 'react-query';
import { Link, useRouteMatch } from 'react-router-dom';

import { UserStatus } from '@/app/admin/users/UserStatus';
import {
  useUserList,
  useUserRemove,
  useUserUpdate,
} from '@/app/admin/users/users.service';
import { Page, PageContent } from '@/app/layout';
import { usePaginationFromUrl } from '@/app/router';
import {
  ActionsButton,
  ConfirmMenuItem,
  DataList,
  DataListCell,
  DataListHeader,
  DataListFooter,
  DataListRow,
  DateAgo,
  Icon,
  useToastError,
  useToastSuccess,
  PaginationButtonFirstPage,
  Pagination,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
} from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

import { AdminNav } from '../AdminNav';

const UserActions = ({ user, ...rest }) => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const { mutate: userUpdate, ...userUpdateData } = useUserUpdate({
    onSuccess: ({ activated, login }) => {
      if (activated) {
        toastSuccess({
          title: t('users:feedbacks.activateUserSuccess.title'),
          description: t('users:feedbacks.activateUserSuccess.description', {
            login,
          }),
        });
      } else {
        toastSuccess({
          title: t('users:feedbacks.deactivateUserSuccess.title'),
          description: t('users:feedbacks.deactivateUserSuccess.description', {
            login,
          }),
        });
      }
    },
    onError: (_, __, { activated, login }) => {
      if (activated) {
        toastError({
          title: t('users:feedbacks.activateUserError.title'),
          description: t('users:feedbacks.activateUserError.description', {
            login,
          }),
        });
      } else {
        toastError({
          title: t('users:feedbacks.deactivateUserError.title'),
          description: t('users:feedbacks.deactivateUserError.description', {
            login,
          }),
        });
      }
    },
  });

  const activateUser = () => userUpdate({ ...user, activated: true });
  const deactivateUser = () => userUpdate({ ...user, activated: false });
  const isActionsLoading = userUpdateData.isLoading;

  const queryClient = useQueryClient();
  const { mutate: userRemove, ...userRemoveData } = useUserRemove({
    onSuccess: (_, { login }) => {
      toastSuccess({
        title: t('users:feedbacks.deleteUserSuccess.title'),
        description: t('users:feedbacks.deleteUserSuccess.description', {
          login,
        }),
      });
      queryClient.invalidateQueries('users');
    },
    onError: (_, { login }) => {
      toastError({
        title: t('users:feedbacks.deleteUserError.title'),
        description: t('users:feedbacks.deleteUserError.description', {
          login,
        }),
      });
    },
  });
  const removeUser = () => userRemove(user);
  const isRemovalLoading = userRemoveData.isLoading;

  return (
    <Menu isLazy placement="left-start" {...rest}>
      <MenuButton
        as={ActionsButton}
        isLoading={isActionsLoading || isRemovalLoading}
      />
      <Portal>
        <MenuList>
          <MenuItem
            as={Link}
            to={`${url}/${user.login}`}
            icon={<Icon icon={FiEdit} fontSize="lg" color="gray.400" />}
          >
            {t('actions.edit')}
          </MenuItem>
          {user.activated ? (
            <MenuItem
              onClick={deactivateUser}
              icon={<Icon icon={FiXCircle} fontSize="lg" color="gray.400" />}
            >
              {t('actions.deactivate')}
            </MenuItem>
          ) : (
            <MenuItem
              onClick={activateUser}
              icon={
                <Icon icon={FiCheckCircle} fontSize="lg" color="gray.400" />
              }
            >
              {t('actions.activate')}
            </MenuItem>
          )}
          <MenuDivider />
          <ConfirmMenuItem
            icon={<Icon icon={FiTrash2} fontSize="lg" color="gray.400" />}
            onClick={removeUser}
          >
            {t('actions.delete')}
          </ConfirmMenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const PageUsers = () => {
  const { t } = useTranslation();
  const { colorModeValue } = useDarkMode();
  const { url } = useRouteMatch();
  const { page, setPage } = usePaginationFromUrl();
  const pageSize = 20;
  const { users, totalItems, isLoadingPage } = useUserList({
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
              to={`${url}/create`}
              variant="@primary"
              leftIcon={<FiPlus />}
            >
              {t('users:list.actions.createUser')}
            </Button>
            <IconButton
              display={{ base: 'flex', sm: 'none' }}
              aria-label={t('users:list.actions.createUser')}
              as={Link}
              to={`${url}/create`}
              size="sm"
              variant="@primary"
              icon={<FiPlus />}
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
              <Box as="span" d={{ base: 'none', md: 'block' }}>
                {t('users:data.status.label')}
              </Box>
            </DataListCell>
            <DataListCell colName="actions" colWidth="4rem" align="flex-end" />
          </DataListHeader>
          {users?.map((user) => (
            <DataListRow as={LinkBox} key={user.id}>
              <DataListCell colName="login">
                <HStack maxW="100%">
                  <Avatar size="sm" name={user.login} mx="1" />
                  <Box minW="0">
                    <Text isTruncated maxW="full" fontWeight="bold">
                      <LinkOverlay as={Link} to={`${url}/${user.login}`}>
                        {user.login}
                      </LinkOverlay>
                    </Text>
                    <Text
                      isTruncated
                      maxW="full"
                      fontSize="sm"
                      color={colorModeValue('gray.600', 'gray.300')}
                    >
                      {user.email}
                    </Text>
                  </Box>
                </HStack>
              </DataListCell>
              <DataListCell colName="id">
                <Text isTruncated maxW="full" as={Code} fontSize="xs">
                  {user.id}
                </Text>
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
                <Text isTruncated maxW="full">
                  {user.createdBy}
                </Text>
                {!!user.createdDate && (
                  <Text
                    isTruncated
                    maxW="full"
                    color={colorModeValue('gray.600', 'gray.300')}
                    pointerEvents="auto"
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
                <Text isTruncated maxW="full">
                  {user.lastModifiedBy}
                </Text>
                {!!user.lastModifiedDate && (
                  <Text
                    isTruncated
                    maxW="full"
                    color={colorModeValue('gray.600', 'gray.300')}
                    pointerEvents="auto"
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
              isLoadingPage={isLoadingPage}
              setPage={setPage}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
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
};
