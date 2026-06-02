import { Link } from '@tanstack/react-router';
import {
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

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/platform/components/ui/avatar';
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
} from '@/platform/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/platform/components/ui/sidebar';
import { useSidebar } from '@/platform/components/ui/sidebar-context';
import { themes } from '@/platform/components/ui/theme-options';

import {
  BuildInfoDrawer,
  BuildInfoVersion,
} from '@/app/build-info/presentation';
import { ConfirmSignOut } from '@/modules/auth/client';
import { WithPermissions } from '@/modules/auth/client';
import { useAuthSession } from '@/modules/auth/client';

type Theme = (typeof themes)[number];

const isTheme = (value: string | undefined): value is Theme =>
  themes.some((theme) => theme === value);

export function NavUser() {
  const { t } = useTranslation(['common', 'auth', 'layout']);
  const { isMobile } = useSidebar();
  const session = useAuthSession();
  const { setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const selectedTheme = isTheme(theme) ? theme : 'system';

  const user = {
    avatar: session.data?.user.image ?? undefined,
    name: session.data?.user.name ?? undefined,
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
            <DropdownMenuRadioGroup
              value={selectedTheme}
              onValueChange={setTheme}
            >
              {themes.map((item) => (
                <DropdownMenuRadioItem
                  key={item}
                  value={item}
                  icon={match(selectedTheme)
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
