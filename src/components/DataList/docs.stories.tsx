import {
  Avatar,
  Button,
  LinkBox,
  LinkOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { LuCheck, LuPenLine, LuPlus, LuX } from 'react-icons/lu';

import { ActionsButton } from '@/components/ActionsButton';
import { Icon } from '@/components/Icons';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
  DataListTextHeader,
} from '.';

export default {
  title: 'Components/DataList',
};

const data = [
  {
    id: 1,
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    job: 'Regional Paradigm Technician',
    department: 'Optimization',
    status: 'active',
    role: 'Admin',
    wallet: 42,
  },
  {
    id: 2,
    name: 'Cody Fisher',
    email: 'cody.fisher@example.com',
    job: 'Product Directives Officer',
    department: 'Intranet',
    status: 'active',
    role: 'Owner',
    wallet: 142,
  },
  {
    id: 3,
    name: 'Esther Howard',
    email: 'esther.howard@example.com',
    job: 'Forward Response Developer',
    department: 'Directives',
    status: 'inactive',
    role: 'Member',
    wallet: 23,
  },
  {
    id: 4,
    name: 'Emily Esther',
    email: 'emily.esther@example.com',
    job: 'Forward Response Developer',
    department: 'Directives',
    status: 'inactive',
    role: 'Member',
    wallet: 132,
  },
] as const;

export const Default = () => (
  <DataList>
    {data.map((user) => (
      <DataListRow key={user.id} as={LinkBox} withHover>
        <DataListCell w="auto">
          <Avatar size="sm" name={user.name} />
        </DataListCell>
        <DataListCell>
          <DataListText fontWeight="bold">
            <LinkOverlay href="#">{user.name}</LinkOverlay>
          </DataListText>
          <DataListText color="text-dimmed">{user.email}</DataListText>
        </DataListCell>
        <DataListCell flex={0.8} display={{ base: 'none', sm: 'flex' }}>
          <DataListText color="text-dimmed">{user.job}</DataListText>
        </DataListCell>
        <DataListCell flex={0.4} display={{ base: 'none', md: 'flex' }}>
          <DataListText color="text-dimmed">{user.role}</DataListText>
        </DataListCell>
        <DataListCell
          w={{ base: 'auto', md: '5rem', lg: '8rem' }}
          align="center"
        >
          <ExampleStatus status={user.status} />
        </DataListCell>
        <DataListCell w="auto" p={0}>
          <ExampleMenu />
        </DataListCell>
      </DataListRow>
    ))}
  </DataList>
);

export const WithHeaders = () => (
  <DataList>
    <DataListRow>
      <DataListCell>
        <DataListTextHeader>Name</DataListTextHeader>
      </DataListCell>
      <DataListCell>
        <DataListTextHeader>Email</DataListTextHeader>
      </DataListCell>
      <DataListCell align="end">
        <DataListTextHeader>Wallet</DataListTextHeader>
      </DataListCell>
      <DataListCell align="center">
        <DataListTextHeader>Role</DataListTextHeader>
      </DataListCell>
    </DataListRow>
    {data.map((user) => (
      <DataListRow key={user.id}>
        <DataListCell>
          <DataListText fontWeight="bold">{user.name}</DataListText>
        </DataListCell>
        <DataListCell>
          <DataListText>{user.email}</DataListText>
        </DataListCell>
        <DataListCell align="end">
          <DataListText>{user.wallet}$</DataListText>
        </DataListCell>
        <DataListCell align="center">
          <DataListText color="text-dimmed">{user.role}</DataListText>
        </DataListCell>
      </DataListRow>
    ))}
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
    <Stack>
      <DataList>
        <DataListEmptyState />
      </DataList>
      <DataList>
        <DataListEmptyState searchTerm="Admin" />
      </DataList>
      <DataList>
        <DataListEmptyState>
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
    </Stack>
  );
};
export const ErrorState = () => {
  return (
    <Stack>
      <DataList>
        <DataListErrorState />
      </DataList>
      <DataList>
        <DataListErrorState retry={() => alert('Retry')} />
      </DataList>
      <DataList>
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

const ExampleStatus = ({ status }: { status: 'active' | 'inactive' }) => {
  return (
    <Tag
      size="sm"
      colorScheme={status === 'active' ? 'success' : 'warning'}
      gap={1}
      justifyContent="center"
      px={{ base: 0, md: 2 }}
    >
      <TagLeftIcon as={status === 'active' ? LuCheck : LuX} mr={0} />
      <TagLabel
        lineHeight={1}
        display={{ base: 'none', md: 'inline' }}
        whiteSpace="nowrap"
      >
        {status === 'active' ? 'Active' : 'Inactive'}
      </TagLabel>
    </Tag>
  );
};

const ExampleMenu = () => {
  return (
    <Menu isLazy placement="left-start">
      <MenuButton as={ActionsButton} />
      <Portal>
        <MenuList>
          <MenuItem
            icon={<Icon icon={LuPenLine} fontSize="lg" color="gray.400" />}
          >
            Edit
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};
