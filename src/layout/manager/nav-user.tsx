import { Link } from '@tanstack/react-router';
import {
  BookOpenIcon,
  ChevronsUpDownIcon,
  CircleUserIcon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { themes } from '@/components/ui/theme-switcher';

import { authClient } from '@/features/auth/client';
import { ConfirmSignOut } from '@/features/auth/confirm-signout';
import { WithPermissions } from '@/features/auth/with-permission';
import { BuildInfoDrawer } from '@/features/build-info/build-info-drawer';
import { BuildInfoVersion } from '@/features/build-info/build-info-version';

export function NavUser() {
  const { t } = useTranslation(['common', 'auth', 'layout']);
  const { isMobile } = useSidebar();
  const session = authClient.useSession();
  const { setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  const user = {
    avatar: session.data?.user.image ?? undefined,
    name: session.data?.user.name,
    email: session.data?.user.email,
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback variant="boring" name={user.name ?? ''} />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
            finalFocus={false}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback variant="boring" name={user.name ?? ''} />
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    to="/manager/account"
                    onClick={() => setOpenMobile(false)}
                  />
                }
              >
                <CircleUserIcon />
                {t('layout:nav.account')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {themes.map((item) => (
                <DropdownMenuRadioItem
                  key={item}
                  value={item}
                  icon={match(theme as (typeof themes)[number])
                    .with('system', () => (
                      <SunMoonIcon className="text-muted-foreground" />
                    ))
                    .with('light', () => (
                      <SunIcon className="text-muted-foreground" />
                    ))
                    .with('dark', () => (
                      <MoonIcon className="text-muted-foreground" />
                    ))
                    .exhaustive()}
                >
                  {t(`common:themes.values.${item}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <WithPermissions
                permissions={[
                  {
                    apps: ['app'],
                  },
                ]}
              >
                <DropdownMenuItem render={<Link to="/app" />}>
                  <MonitorSmartphoneIcon />
                  {t('layout:nav.openApp')}
                </DropdownMenuItem>
              </WithPermissions>
              <DropdownMenuItem
                render={
                  <a
                    href="/api/openapi/app"
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                }
              >
                <BookOpenIcon />
                {t('layout:nav.apiDocumentation')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ConfirmSignOut>
              <DropdownMenuItem closeOnClick={false}>
                <LogOutIcon />
                {t('auth:signOut.action')}
              </DropdownMenuItem>
            </ConfirmSignOut>
            <DropdownMenuSeparator />
            <BuildInfoDrawer nativeButtonTrigger={false}>
              <DropdownMenuItem
                closeOnClick={false}
                className="py-1 text-xs text-muted-foreground"
              >
                <BuildInfoVersion />
              </DropdownMenuItem>
            </BuildInfoDrawer>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
