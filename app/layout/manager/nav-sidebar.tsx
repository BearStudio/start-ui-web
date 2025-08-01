import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  LayoutDashboardIcon,
  PanelLeftIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';
import { IconBookOpen } from '@/components/icons/generated';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

import { WithPermissions } from '@/features/auth/with-permission';
import { NavUser } from '@/layout/manager/nav-user';

export const NavSidebar = (props: { children?: ReactNode }) => {
  const { t } = useTranslation(['layout']);
  const matchRoute = useMatchRoute();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto">
                  <Link to="/manager">
                    <span>
                      <Logo className="w-24 group-data-[collapsible=icon]:w-18" />
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarTrigger
              className="group-data-[collapsible=icon]:hidden"
              icon={
                <>
                  <XIcon className="md:hidden" />
                  <PanelLeftIcon className="hidden md:block rtl:rotate-180" />
                </>
              }
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('layout:nav.application')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!matchRoute({ to: '/manager/dashboard', fuzzy: true })
                    }
                  >
                    <Link to="/manager/dashboard">
                      <LayoutDashboardIcon />
                      <span>{t('layout:nav.dashboard')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!matchRoute({ to: '/manager/books', fuzzy: true })
                    }
                  >
                    <Link to="/manager/books">
                      <IconBookOpen />
                      <span>{t('layout:nav.books')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <WithPermissions
            permissions={[
              {
                user: ['list'],
              },
            ]}
          >
            <SidebarGroup>
              <SidebarGroupLabel>
                {t('layout:nav.configuration')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        !!matchRoute({ to: '/manager/users', fuzzy: true })
                      }
                    >
                      <Link to="/manager/users">
                        <UsersIcon />
                        <span>{t('layout:nav.users')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </WithPermissions>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{props.children}</SidebarInset>
    </SidebarProvider>
  );
};
