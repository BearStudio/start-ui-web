import {
  Avatar,
  Badge,
  Box,
  Button,
  Code,
  HStack,
  LinkBox,
  LinkOverlay,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { LuCopy, LuEdit, LuPlus, LuTrash2, LuUserPlus } from 'react-icons/lu';

import { ActionsButton } from '@/components/ActionsButton';
import { Icon } from '@/components/Icons';
import {
  Pagination,
  PaginationButtonFirstPage,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
} from '@/components/Pagination';

import {
  DataList,
  DataListAccordion,
  DataListAccordionButton,
  DataListAccordionIcon,
  DataListAccordionPanel,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListFooter,
  DataListHeader,
  DataListLoadingState,
  DataListRow,
} from './index';

export default {
  title: 'Components/DataList',
};

export const Default = () => (
  <Stack spacing="6">
    <Text>
      An DataList is composed of Header, Rows and Cells. To link Cells with
      columns, each <Code>{`<DataListCell />`}</Code> must have a{' '}
      <Code>{`colName="column-name"`}</Code> property.
    </Text>
    <DataList>
      <DataListHeader>
        <DataListCell colName="colA">Header A</DataListCell>
        <DataListCell colName="colB">Header B</DataListCell>
        <DataListCell colName="colC">Header C</DataListCell>
      </DataListHeader>
      <DataListRow>
        <DataListCell colName="colA">Row 1 - Column A</DataListCell>
        <DataListCell colName="colB">Row 1 - Column B</DataListCell>
        <DataListCell colName="colC">Row 1 - Column C</DataListCell>
      </DataListRow>
      <DataListRow>
        <DataListCell colName="colA">Row 2 - Column A</DataListCell>
        <DataListCell colName="colB">Row 2 - Column B</DataListCell>
        <DataListCell colName="colC">Row 2 - Column C</DataListCell>
      </DataListRow>
    </DataList>
  </Stack>
);

export const ColumnSizes = () => (
  <Stack spacing="6">
    <Text>
      Apply a <Code>{`colWidth`}</Code> on the <Code>{`<DataListCell />`}</Code>{' '}
      of the column in the <Code>{`<DataListHeader />`}</Code> component to
      control the columns width.
    </Text>
    <DataList>
      <DataListHeader>
        <DataListCell colName="colA" colWidth="3" bg="rgba(0, 0, 0, 0.02)">
          <Code>{`colWidth="3"`}</Code>
        </DataListCell>
        <DataListCell colName="colB">Header</DataListCell>
      </DataListHeader>
      <DataListRow>
        <DataListCell colName="colA">Cell</DataListCell>
        <DataListCell colName="colB">Cell</DataListCell>
      </DataListRow>
      <DataListRow>
        <DataListCell colName="colA">Cell</DataListCell>
        <DataListCell colName="colB">Cell</DataListCell>
      </DataListRow>
    </DataList>
    <Text>
      Set a relative <Code>{`colWidth="3"`}</Code> or{' '}
      <Code>{`colWidth={3}`}</Code> to allow the column to take 3 times the
      default size.
    </Text>
    <DataList>
      <DataListHeader>
        <DataListCell colName="colA" colWidth="10rem" bg="rgba(0, 0, 0, 0.02)">
          <Code>{`colWidth="10rem"`}</Code>
        </DataListCell>
        <DataListCell colName="colB">Header</DataListCell>
      </DataListHeader>
      <DataListRow>
        <DataListCell colName="colA">Cell</DataListCell>
        <DataListCell colName="colB">Cell</DataListCell>
      </DataListRow>
      <DataListRow>
        <DataListCell colName="colA">Cell</DataListCell>
        <DataListCell colName="colB">Cell</DataListCell>
      </DataListRow>
    </DataList>
    <Text>
      Set css width <Code>{`colWidth="10rem"`}</Code> or{' '}
      <Code>{`colWidth="25%"`}</Code> for allowing the column to take the given
      size.
      <br />
      You can use responsive value for <Code>{`colWidth`}</Code> like this{' '}
      <Code>{`colWidth={{ base: 1, md: '10rem' }}`}</Code>
    </Text>
  </Stack>
);

export const ColumnVisibility = () => (
  <Stack spacing="6">
    <Text>
      Apply a <Code>{`isVisible`}</Code> on the{' '}
      <Code>{`<DataListCell />`}</Code> of the column in the{' '}
      <Code>{`<DataListHeader />`}</Code> component to control the columns
      visibility.
      <br />
      You can use responsive value for <Code>{`isVisible`}</Code> like this{' '}
      <Code>{`isVisible={{ base: false, md: true }}`}</Code>
    </Text>
    <DataList>
      <DataListHeader>
        <DataListCell colName="colA" isVisible={{ base: false, md: true }}>
          <Code>{`isVisible={{ base: false, md: true }}`}</Code>
        </DataListCell>
        <DataListCell colName="colB" isVisible={{ base: true, md: false }}>
          <Code>{`isVisible={{ base: true, md: false }}`}</Code>
        </DataListCell>
      </DataListHeader>
      <DataListRow>
        <DataListCell colName="colA">Only Large Screen</DataListCell>
        <DataListCell colName="colB">Only Small Screen</DataListCell>
      </DataListRow>
      <DataListRow>
        <DataListCell colName="colA">Only Large Screen</DataListCell>
        <DataListCell colName="colB">Only Small Screen</DataListCell>
      </DataListRow>
    </DataList>
  </Stack>
);

export const NoHover = () => (
  <DataList isHover={false}>
    <DataListHeader>
      <DataListCell colName="colA">Header A</DataListCell>
      <DataListCell colName="colB">Header B</DataListCell>
      <DataListCell colName="colC">Header C</DataListCell>
    </DataListHeader>
    <DataListRow>
      <DataListCell colName="colA">Row 1 - Column A</DataListCell>
      <DataListCell colName="colB">Row 1 - Column B</DataListCell>
      <DataListCell colName="colC">Row 1 - Column C</DataListCell>
    </DataListRow>
    <DataListRow>
      <DataListCell colName="colA">Row 2 - Column A</DataListCell>
      <DataListCell colName="colB">Row 2 - Column B</DataListCell>
      <DataListCell colName="colC">Row 2 - Column C</DataListCell>
    </DataListRow>
  </DataList>
);

export const LoadingState = () => {
  return (
    <DataList>
      <DataListLoadingState />
    </DataList>
  );
};

export const EmptyState = () => {
  return (
    <DataList>
      <DataListEmptyState />
      <DataListEmptyState title="No Users">
        <Wrap spacingX={2} spacingY={1}>
          <Text alignSelf="center">Let&apos;s create your first user</Text>
          <Button
            variant="ghost"
            colorScheme="info"
            size="sm"
            leftIcon={<LuPlus />}
          >
            Create User
          </Button>
        </Wrap>
      </DataListEmptyState>
    </DataList>
  );
};

export const ErrorState = () => {
  return (
    <Stack>
      <DataList>
        <DataListErrorState />
        <DataListErrorState retry={() => alert('Retry')} />
        <DataListErrorState
          title="Failed to load the users"
          retry={() => alert('Retry')}
        >
          Something wrong happen, please retry or contact the administator
        </DataListErrorState>
      </DataList>
    </Stack>
  );
};

export const Complete = () => {
  const users = [
    {
      name: 'Jane Cooper',
      email: 'jane.cooper@example.com',
      job: 'Regional Paradigm Technician',
      department: 'Optimization',
      status: 'Active',
      role: 'Admin',
    },
    {
      name: 'Cody Fisher',
      email: 'cody.fisher@example.com',
      job: 'Product Directives Officer',
      department: 'Intranet',
      status: 'Active',
      role: 'Owner',
    },
    {
      name: 'Esther Howard',
      email: 'esther.howard@example.com',
      job: 'Forward Response Developer',
      department: 'Directives',
      status: 'Inactive',
      role: 'Member',
    },
  ];
  return (
    <DataList>
      <DataListHeader isVisible={{ base: false, md: true }}>
        <DataListCell colName="name" colWidth="1.5">
          Name
        </DataListCell>
        <DataListCell colName="title" isVisible={{ base: false, md: true }}>
          Title
        </DataListCell>
        <DataListCell
          colName="status"
          colWidth="0.6"
          isVisible={{ base: false, md: true }}
        >
          Status
        </DataListCell>
        <DataListCell
          colName="role"
          colWidth="0.6"
          isVisible={{ base: false, md: true }}
        >
          Role
        </DataListCell>
        <DataListCell colName="actions" colWidth="4rem" align="flex-end" />
      </DataListHeader>
      {users.map((item, index) => (
        <DataListRow
          as={LinkBox}
          key={index}
          isDisabled={item.status === 'Inactive'}
        >
          <DataListCell colName="name">
            <HStack maxW="100%">
              <Avatar size="sm" name={item.name} mx="2" />
              <Box minW="0">
                <Text noOfLines={1} maxW="full" fontWeight="bold">
                  {item.status !== 'Inactive' ? (
                    <LinkOverlay href="#">{item.name}</LinkOverlay>
                  ) : (
                    item.name
                  )}
                </Text>
                <Text
                  noOfLines={1}
                  maxW="full"
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.300' }}
                >
                  {item.email}
                </Text>
              </Box>
            </HStack>
          </DataListCell>
          <DataListCell colName="title" fontSize="sm">
            <Text noOfLines={1} maxW="full">
              {item.job}
            </Text>
            <Text
              noOfLines={1}
              maxW="full"
              color="gray.600"
              _dark={{ color: 'gray.300' }}
            >
              {item.department}
            </Text>
          </DataListCell>
          <DataListCell colName="status">
            <Badge
              size="sm"
              colorScheme={item.status === 'Active' ? 'success' : 'gray'}
            >
              {item.status}
            </Badge>
          </DataListCell>
          <DataListCell colName="role" fontSize="sm">
            <Text
              noOfLines={1}
              maxW="full"
              color="gray.600"
              _dark={{ color: 'gray.300' }}
            >
              {item.role}
            </Text>
          </DataListCell>
          <DataListCell colName="actions">
            <Menu isLazy placement="left-start">
              <MenuButton
                as={ActionsButton}
                isDisabled={item.status === 'Inactive'}
              />
              <MenuList>
                <MenuItem
                  icon={<Icon icon={LuEdit} fontSize="lg" color="gray.400" />}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<Icon icon={LuCopy} fontSize="lg" color="gray.400" />}
                >
                  Duplicate
                </MenuItem>
                <MenuItem
                  icon={
                    <Icon icon={LuUserPlus} fontSize="lg" color="gray.400" />
                  }
                >
                  Share
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </DataListCell>
        </DataListRow>
      ))}
      <DataListFooter>
        <Pagination
          isLoadingPage={false}
          setPage={() => undefined}
          page={1}
          pageSize={10}
          totalItems={89}
        >
          <PaginationButtonFirstPage />
          <PaginationButtonPrevPage />
          <PaginationInfo flex="1" />
          <PaginationButtonNextPage />
          <PaginationButtonLastPage />
        </Pagination>
      </DataListFooter>
    </DataList>
  );
};

export const CompleteWithCollapse = () => {
  const users = [
    {
      name: 'Jane Cooper',
      email: 'jane.cooper@example.com',
      job: 'Regional Paradigm Technician',
      department: 'Optimization',
      status: 'Active',
      role: 'Admin',
    },
    {
      name: 'Cody Fisher',
      email: 'cody.fisher@example.com',
      job: 'Product Directives Officer',
      department: 'Intranet',
      status: 'Active',
      role: 'Owner',
    },
    {
      name: 'Esther Howard',
      email: 'esther.howard@example.com',
      job: 'Forward Response Developer',
      department: 'Directives',
      status: 'Inactive',
      role: 'Member',
    },
  ];
  return (
    <DataList defaultIndex={[0]}>
      <DataListHeader isVisible={{ base: false, md: true }}>
        <DataListCell colName="name" colWidth="1.5">
          Name
        </DataListCell>
        <DataListCell
          colName="status"
          colWidth="0.6"
          isVisible={{ base: false, md: true }}
        >
          Status
        </DataListCell>
        <DataListCell colName="actions" colWidth="2rem" align="flex-end" />
      </DataListHeader>
      {users.map((item, index) => (
        <DataListAccordion key={index} isDisabled={item.status === 'Inactive'}>
          <DataListRow
            as={DataListAccordionButton}
            isDisabled={item.status === 'Inactive'}
          >
            <DataListCell colName="name">
              <HStack maxW="100%">
                <Avatar size="sm" name={item.name} mx="2" />
                <Box minW="0">
                  <Text noOfLines={1} maxW="full" fontWeight="bold">
                    {item.name}
                  </Text>
                  <Text
                    noOfLines={1}
                    maxW="full"
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.300' }}
                  >
                    {item.email}
                  </Text>
                </Box>
              </HStack>
            </DataListCell>
            <DataListCell colName="status">
              <Badge
                size="sm"
                colorScheme={item.status === 'Active' ? 'success' : 'gray'}
              >
                {item.status}
              </Badge>
            </DataListCell>
            <DataListCell colName="actions">
              <DataListAccordionIcon />
            </DataListCell>
          </DataListRow>
          <DataListAccordionPanel>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
              <Box fontSize="sm">
                <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                  Label
                </Text>
                <Text>Value</Text>
              </Box>
              <Box fontSize="sm">
                <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                  Label
                </Text>
                <Text>Value</Text>
              </Box>
              <Box fontSize="sm">
                <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                  Label
                </Text>
                <Text>Value</Text>
              </Box>
              <Box fontSize="sm">
                <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                  Label
                </Text>
                <Text>Value</Text>
              </Box>
              <Box fontSize="sm" gridColumn="1/-1">
                <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                  Comment
                </Text>
                <Text>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Distinctio atque cupiditate dicta sed est nesciunt dignissimos
                  dolor nam. Nemo quisquam repudiandae tempora eius fugit
                  laborum distinctio ex omnis recusandae sapiente.
                </Text>
              </Box>
            </SimpleGrid>
          </DataListAccordionPanel>
        </DataListAccordion>
      ))}
    </DataList>
  );
};
