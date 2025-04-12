import { authClient } from '@/lib/auth/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export const AccountUserCard = () => {
  const session = authClient.useSession();
  return (
    <Card>
      <CardContent className="flex min-w-0 gap-4 max-md:flex-col md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar>
            <AvatarFallback
              variant="boring"
              name={session.data?.user.name ?? ''}
            />
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate">
              {session.data?.user.name || (
                <span className="text-xs text-muted-foreground">N/A</span>
              )}
            </CardTitle>
            <CardDescription className="truncate">
              {session.data?.user.email}
            </CardDescription>
          </div>
        </div>
        <div className="-my-2 flex flex-none flex-wrap gap-x-4">
          <ThemeSwitcher />
          <LocalSwitcher />
        </div>
      </CardContent>
    </Card>
  );
};
