import { Link, useMatchRoute } from '@tanstack/react-router';
import { UsersIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { IconGitBranch } from '@/components/icons/generated';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export const SidebarManager = (props: { children?: ReactNode }) => {
  const matchRoute = useMatchRoute();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-auto">
                <Link to="/manager">
                  <span>
                    <Logo className="w-24" />
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={!!matchRoute({ to: '/manager/repository' })}
                  >
                    <Link to="/manager/repository">
                      <IconGitBranch />
                      <span>Repositories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Configuration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={!!matchRoute({ to: '/manager/user' })}
                  >
                    <Link to="/manager/user">
                      <UsersIcon />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="relative flex flex-1 flex-col">
        <SidebarInset>
          <SidebarTrigger className="absolute top-2 left-2 z-10" />
          {props.children}
        </SidebarInset>
      </main>
    </SidebarProvider>
  );
};
