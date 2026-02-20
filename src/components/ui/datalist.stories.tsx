import {
  EllipsisIcon,
  PencilLineIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListRowResults,
  DataListText,
  DataListTextHeader,
} from '@/components/ui/datalist';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default {
  title: 'DataList',
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
    {data.map((user) => {
      return (
        <DataListRow key={user.id} withHover>
          <DataListCell className="flex-none">
            <Avatar>
              <AvatarFallback variant="boring" name={user.name} />
            </Avatar>
          </DataListCell>
          <DataListCell>
            <DataListText className="font-medium">
              <a
                href="https://start-ui.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.name}
                {/* Row hitzone for link */}
                <span className="absolute inset-0" />
              </a>
            </DataListText>
            <DataListText className="text-muted-foreground">
              {user.email}
            </DataListText>
          </DataListCell>
          <DataListCell className="max-sm:hidden">
            <DataListText className="text-muted-foreground">
              {user.job}
            </DataListText>
          </DataListCell>
          <DataListCell className="max-md:hidden">
            <DataListText className="text-muted-foreground">
              {user.role}
            </DataListText>
          </DataListCell>
          <DataListCell className="flex-none items-end">
            <ExampleMenu />
          </DataListCell>
        </DataListRow>
      );
    })}
  </DataList>
);

export const WithHeader = () => (
  <DataList>
    <DataListRow>
      <DataListCell className="w-12 flex-none" />
      <DataListCell>
        <DataListTextHeader>Name</DataListTextHeader>
      </DataListCell>
      <DataListCell className="max-sm:hidden">
        <DataListTextHeader>Job</DataListTextHeader>
      </DataListCell>
      <DataListCell className="max-md:hidden">
        <DataListTextHeader>Role</DataListTextHeader>
      </DataListCell>
      <DataListCell className="w-12 flex-none items-end" />
    </DataListRow>
    {data.map((user) => {
      return (
        <DataListRow key={user.id} withHover>
          <DataListCell className="w-12 flex-none">
            <Avatar>
              <AvatarFallback variant="boring" name={user.name} />
            </Avatar>
          </DataListCell>
          <DataListCell>
            <DataListText className="font-medium">
              <a
                href="https://start-ui.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.name}
                {/* Row hitzone for link */}
                <span className="absolute inset-0" />
              </a>
            </DataListText>
            <DataListText className="text-muted-foreground">
              {user.email}
            </DataListText>
          </DataListCell>
          <DataListCell className="max-sm:hidden">
            <DataListText className="text-muted-foreground">
              {user.job}
            </DataListText>
          </DataListCell>
          <DataListCell className="max-md:hidden">
            <DataListText className="text-muted-foreground">
              {user.role}
            </DataListText>
          </DataListCell>
          <DataListCell className="w-12 flex-none items-end">
            <ExampleMenu />
          </DataListCell>
        </DataListRow>
      );
    })}
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
    <div className="flex flex-col gap-4">
      <DataList>
        <DataListEmptyState />
      </DataList>
      <DataList>
        <DataListEmptyState searchTerm="Admin" />
      </DataList>
      <DataList>
        <DataListEmptyState>
          <div className="flex flex-col items-center justify-center gap-x-2 gap-y-1">
            <p className="self-center">Let&apos;s add your first user</p>
            <Button variant="ghost" size="sm">
              <PlusIcon />
              New User
            </Button>
          </div>
        </DataListEmptyState>
      </DataList>
    </div>
  );
};

export const ErrorState = () => {
  return (
    <div className="flex flex-col gap-4">
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
          Retry or contact the administator
        </DataListErrorState>
      </DataList>
    </div>
  );
};

export const RowResults = () => (
  <DataList>
    <DataListRowResults withClearButton onClear={() => alert('Clear')}>
      4 results for "Search term"
    </DataListRowResults>
    {data.map((user) => {
      return (
        <DataListRow key={user.id} withHover>
          <DataListCell className="flex-none">
            <Avatar>
              <AvatarFallback variant="boring" name={user.name} />
            </Avatar>
          </DataListCell>
          <DataListCell>
            <DataListText className="font-medium">
              <a
                href="https://start-ui.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.name}
                {/* Row hitzone for link */}
                <span className="absolute inset-0" />
              </a>
            </DataListText>
            <DataListText className="text-muted-foreground">
              {user.email}
            </DataListText>
          </DataListCell>
          <DataListCell className="max-sm:hidden">
            <DataListText className="text-muted-foreground">
              {user.job}
            </DataListText>
          </DataListCell>
          <DataListCell className="max-md:hidden">
            <DataListText className="text-muted-foreground">
              {user.role}
            </DataListText>
          </DataListCell>
          <DataListCell className="flex-none items-end">
            <ExampleMenu />
          </DataListCell>
        </DataListRow>
      );
    })}
  </DataList>
);

const ExampleMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button size="icon-sm" variant="ghost" className="-m-1" />}
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" className="min-w-24">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PencilLineIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
