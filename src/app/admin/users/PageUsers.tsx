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
} from '@chakra-ui/react';
import {
  Eye,
  PencilLine,
  CheckCircle,
  XCircle,
  TrashSimple,
} from 'phosphor-react';
import { Link, useRouteMatch } from 'react-router-dom';

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
  TextEllipsis,
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
  const { path } = useRouteMatch();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [userUpdate, userUpdateData] = useUserUpdate({
    onSuccess: ({ activated, login }) => {
      if (activated) {
        toastSuccess({
          title: 'Account Activated',
          description: `Account "${login}" activated with success`,
        });
      } else {
        toastSuccess({
          title: 'Account Deactivated',
          description: `Account "${login}" deactivated with success`,
        });
      }
    },
    onError: (_, { activated, login }) => {
      if (activated) {
        toastError({
          title: 'Activation Failed',
          description: `Fail to activate "${login}" account`,
        });
      } else {
        toastError({
          title: 'Deactivation Failed',
          description: `Fail to deactivate "${login}" account`,
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
            icon={
              <Icon
                as={Eye}
                fontSize="1.5em"
                weight="duotone"
                color="gray.500"
              />
            }
          >
            View
          </MenuItem>
          <MenuItem
            as={Link}
            to={`${path}${user.login}/edit`}
            icon={
              <Icon
                as={PencilLine}
                fontSize="1.5em"
                weight="duotone"
                color="gray.500"
              />
            }
          >
            Edit
          </MenuItem>
          {user.activated ? (
            <MenuItem
              onClick={deactivateUser}
              icon={
                <Icon
                  as={XCircle}
                  fontSize="1.5em"
                  weight="duotone"
                  color="gray.500"
                />
              }
            >
              Deactivate Account
            </MenuItem>
          ) : (
            <MenuItem
              onClick={activateUser}
              icon={
                <Icon
                  as={CheckCircle}
                  fontSize="1.5em"
                  weight="duotone"
                  color="gray.500"
                />
              }
            >
              Activate Account
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem
            icon={
              <Icon
                as={TrashSimple}
                fontSize="1.5em"
                weight="duotone"
                color="gray.500"
              />
            }
          >
            Delete
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const PageUsers = () => {
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
        <Heading size="md">User Management</Heading>
      </PageHeader>
      <PageBody>
        <DataList>
          <DataListHeader isVisible={{ base: false, md: true }}>
            <DataListCell colName="login" colWidth="200%">
              Login / Email
            </DataListCell>
            <DataListCell
              colName="id"
              colWidth="4rem"
              isVisible={{ base: false, lg: true }}
            >
              ID
            </DataListCell>
            <DataListCell
              colName="authorities"
              isVisible={{ base: false, lg: true }}
            >
              Authorities
            </DataListCell>
            <DataListCell
              colName="created"
              isVisible={{ base: false, lg: true }}
            >
              Created by
            </DataListCell>
            <DataListCell
              colName="lastModified"
              isVisible={{ base: false, md: true }}
            >
              Modified by
            </DataListCell>
            <DataListCell
              colName="status"
              colWidth={{ base: '2rem', md: '50%' }}
              align="center"
            >
              <Box as="span" d={{ base: 'none', md: 'block' }}>
                Status
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
                    <TextEllipsis fontWeight="bold">{user.login}</TextEllipsis>
                    <TextEllipsis fontSize="sm" color="gray.600">
                      {user.email}
                    </TextEllipsis>
                  </Box>
                </HStack>
              </DataListCell>
              <DataListCell colName="id">
                <TextEllipsis as={Code} fontSize="xs">
                  {user.id}
                </TextEllipsis>
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
                <TextEllipsis>{user.createdBy}</TextEllipsis>
                {!!user.createdDate && (
                  <TextEllipsis color="gray.600" pointerEvents="auto">
                    <DateAgo date={user.createdDate} />
                  </TextEllipsis>
                )}
              </DataListCell>
              <DataListCell
                colName="lastModified"
                fontSize="sm"
                position="relative"
                pointerEvents="none"
              >
                <TextEllipsis>{user.lastModifiedBy}</TextEllipsis>
                {!!user.lastModifiedDate && (
                  <TextEllipsis color="gray.600" pointerEvents="auto">
                    <DateAgo position="relative" date={user.lastModifiedDate} />
                  </TextEllipsis>
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
