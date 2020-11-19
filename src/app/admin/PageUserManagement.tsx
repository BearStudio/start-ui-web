import React, { useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import {
  Code,
  Badge,
  Wrap,
  WrapItem,
  HStack,
  Avatar,
  Box,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  MenuItem,
  Heading,
} from '@chakra-ui/react';
import {
  Eye,
  PencilLine,
  CheckCircle,
  XCircle,
  TrashSimple,
  Check,
  X,
  CaretDoubleLeft,
  CaretLeft,
  CaretRight,
  CaretDoubleRight,
} from 'phosphor-react';
import { useUserList, useUserUpdate } from '@/app/admin/service';
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
} from '@/components';

const UserStatus = ({ isActivated = false, ...rest }) => {
  return isActivated ? (
    <Badge size="sm" colorScheme="success" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        Activated
      </Box>
      <Icon
        as={Check}
        aria-label="Activated"
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  ) : (
    <Badge size="sm" colorScheme="warning" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        Not Activated
      </Box>
      <Icon
        as={X}
        aria-label="Not Activated"
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  );
};

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
      <MenuList>
        <MenuItem
          as={Link}
          to={`${path}/${user.id}`}
          icon={
            <Icon as={Eye} fontSize="1.5em" weight="duotone" color="gray.500" />
          }
        >
          View
        </MenuItem>
        <MenuItem
          as={Link}
          to={`${path}/${user.id}/edit`}
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
    </Menu>
  );
};

export const PageUserManagement = () => {
  const { path } = useRouteMatch();
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const { users, totalItems, hasMore } = useUserList({
    page,
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
              <DataListCell colName="login" as={Link} to={`${path}/${user.id}`}>
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
            <IconButton
              onClick={() => setPage(0)}
              aria-label="First page"
              icon={<Icon as={CaretDoubleLeft} fontSize="1.5em" />}
              size="sm"
              mr="2"
              isDisabled={page < 1}
            />
            <IconButton
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              icon={<Icon as={CaretLeft} fontSize="1.5em" />}
              size="sm"
              isDisabled={page < 1}
            />
            <Box mx="auto" px="2" textAlign="center">
              <Box as="span" d={{ base: 'none', sm: 'inline' }}>
                Showing
              </Box>{' '}
              <strong>{page * pageSize + 1}</strong> to{' '}
              <strong>
                {totalItems && Math.min(page * pageSize + pageSize, totalItems)}
              </strong>{' '}
              of <strong>{totalItems}</strong>{' '}
              <Box as="span" d={{ base: 'none', sm: 'inline' }}>
                results
              </Box>
            </Box>
            <IconButton
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              icon={<Icon as={CaretRight} fontSize="1.5em" />}
              size="sm"
              isDisabled={!hasMore}
            />
            <IconButton
              onClick={() => setPage(Math.ceil(totalItems / pageSize) - 1)}
              aria-label="Last page"
              icon={<Icon as={CaretDoubleRight} fontSize="1.5em" />}
              size="sm"
              ml="2"
              isDisabled={!hasMore}
            />
          </DataListFooter>
        </DataList>
      </PageBody>
    </Page>
  );
};
