'use client';

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

import { authClient } from '@/lib/auth/client';

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
import { Spinner } from '@/components/ui/spinner';
import { themes } from '@/components/ui/theme-switcher';

import { useSignOut } from '@/features/auth/utils';

export function NavUser() {
  const { t } = useTranslation(['common']);
  const { isMobile } = useSidebar();
  const session = authClient.useSession();
  const signOut = useSignOut();
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
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback variant="boring" name={user.name ?? ''} />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
              </div>
              {signOut.isPending ? (
                <Spinner className="ml-auto size-4" />
              ) : (
                <ChevronsUpDownIcon className="ml-auto size-4" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
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
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  to="/manager/account"
                  onClick={() => setOpenMobile(false)}
                >
                  <CircleUserIcon />
                  Account
                </Link>
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
                  {t(`common:themes.${item}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/app">
                  <MonitorSmartphoneIcon />
                  Open App
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut.mutate()}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
