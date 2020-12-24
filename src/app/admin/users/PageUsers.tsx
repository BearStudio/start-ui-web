import React from 'react';

import {
  Code,
  Badge,
  Wrap,
  WrapItem,
  HStack,
  Avatar,
  Box,
  Icon,
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
} from '@chakra-ui/react';
import {
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
import { Link, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { UserStatus } from '@/app/admin/users/UserStatus';
import { useUserList, useUserUpdate } from '@/app/admin/users/service';
import {
  ActionsButton,
  DataList,
  DataListCell,
  DataListHeader,
  DataListFooter,
  DataListRow,
  DateAgo,
  HitZone,
  Page,
  PageBody,
  PageHeader,
  useToastError,
  useToastSuccess,
  usePaginationFromUrl,
  PaginationButtonFirstPage,
  Pagination,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
} from '@/components';

const UserActions = ({ user, ...rest }) => {
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const { mutate: userUpdate, ...userUpdateData } = useUserUpdate({
    onSuccess: ({ activated, login }) => {
      if (activated) {
        toastSuccess({
          title: t('admin:messages.accountActivated.title'),
          description: t('admin:messages.accountActivated.description', { login }),
        });
      } else {
        toastSuccess({
          title: t('admin:messages.accountDeactivated.title'),
          description: t('admin:messages.accountDeactivated.description', { login }),
        });
      }
    },
    onError: (_, __, { activated, login }) => {
      if (activated) {
        toastError({
          title: t('admin:messages.accountActivationFailed.title'),
          description: t('admin:messages.accountActivationFailed.description', { login }),
        });
      } else {
        toastError({
          title: t('admin:messages.accountDeactivationFailed.title'),
          description: t('admin:messages.accountDeactivationFailed.description', { login }),
        });
      }
    },
  });

  const activateUser = () => userUpdate({ ...user, activated: true });
  const deactivateUser = () => userUpdate({ ...user, activated: false });
  const isActionsLoading = userUpdateData.isLoading;
  return (
    <Menu placement="left-start" {...rest}>
      <MenuButton as={ActionsButton} isLoading={isActionsLoading} />
      <Portal>
        <MenuList>
          <MenuItem
            as={Link}
            to={`${path}${user.login}`}
            icon={<Icon as={FiEdit} fontSize="lg" color="gray.400" />}
          >
            {t('admin:actions.edit')}
          </MenuItem>
          {user.activated ? (
            <MenuItem
              onClick={deactivateUser}
              icon={<Icon as={FiXCircle} fontSize="lg" color="gray.400" />}
            >
              {t('admin:actions.deactivateAccount')}
            </MenuItem>
          ) : (
            <MenuItem
              onClick={activateUser}
              icon={<Icon as={FiCheckCircle} fontSize="lg" color="gray.400" />}
            >
              {t('admin:actions.activateAccount')}
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem
            icon={<Icon as={FiTrash2} fontSize="lg" color="gray.400" />}
          >
            {t('admin:actions.delete')}
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const PageUsers = () => {
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  const { page, setPage } = usePaginationFromUrl();
  const pageSize = 2;
  const { users, totalItems, isLoadingPage } = useUserList({
    page: page - 1,
    size: pageSize,
  });

  return (
    <Page containerSize="xl">
      <PageHeader>
        <HStack>
          <Box flex="1">
            <Heading size="md">{t('admin:userManagement')}</Heading>
          </Box>
          <Box>
            <Button
              display={{ base: 'none', sm: 'flex' }}
              as={Link}
              to={`${path}create`}
              colorScheme="brand"
              leftIcon={<FiPlus />}
            >
              {t('admin:actions.createUser')}
            </Button>
            <IconButton
              display={{ base: 'flex', sm: 'none' }}
              aria-label={t('admin:actions.createUser')}
              as={Link}
              to={`${path}create`}
              size="sm"
              colorScheme="brand"
              icon={<FiPlus />}
            />
          </Box>
        </HStack>
      </PageHeader>
      <PageBody>
        <DataList>
          <DataListHeader isVisible={{ base: false, md: true }}>
            <DataListCell colName="login" colWidth="2">
              {t('admin:loginEmail')}
            </DataListCell>
            <DataListCell
              colName="id"
              colWidth="4rem"
              isVisible={{ base: false, lg: true }}
            >
              {t('admin:id')}
            </DataListCell>
            <DataListCell
              colName="authorities"
              isVisible={{ base: false, lg: true }}
            >
              {t('admin:authorities')}
            </DataListCell>
            <DataListCell
              colName="created"
              isVisible={{ base: false, lg: true }}
            >
              {t('admin:createdBy')}
            </DataListCell>
            <DataListCell
              colName="lastModified"
              isVisible={{ base: false, md: true }}
            >
              {t('admin:modifiedBy')}
            </DataListCell>
            <DataListCell
              colName="status"
              colWidth={{ base: '2rem', md: '0.5' }}
              align="center"
            >
              <Box as="span" d={{ base: 'none', md: 'block' }}>
                {t('admin:status')}
              </Box>
            </DataListCell>
            <DataListCell colName="actions" colWidth="4rem" align="flex-end" />
          </DataListHeader>
          {users?.map((user) => (
            <DataListRow key={user.id}>
              <DataListCell
                colName="login"
                as={Link}
                to={`${path}${user.login}`}
              >
                <HitZone />
                <HStack maxW="100%">
                  <Avatar size="sm" name={user.login} mx="1" />
                  <Box minW="0">
                    <Text isTruncated maxW="full" fontWeight="bold">
                      {user.login}
                    </Text>
                    <Text
                      isTruncated
                      maxW="full"
                      fontSize="sm"
                      color="gray.600"
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
                    color="gray.600"
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
                    color="gray.600"
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
      </PageBody>
    </Page>
  );
};
