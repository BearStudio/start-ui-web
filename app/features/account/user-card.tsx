import { LogOutIcon, PenLineIcon } from 'lucide-react';

import { authClient } from '@/lib/auth/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';

import { AccountCardRow } from '@/features/account/account-card-row';
import { ChangeEmailInitDrawer } from '@/features/account/change-email-init-drawer';
import { ChangeEmailVerifyDrawer } from '@/features/account/change-email-verify-drawer';
import { ChangeNameDrawer } from '@/features/account/change-name-drawer';
import { useSignOut } from '@/features/auth/utils';

export const UserCard = () => {
  const session = authClient.useSession();
  const signOut = useSignOut();
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarFallback
              variant="boring"
              name={session.data?.user.name ?? ''}
            />
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate">
              {session.data?.user.name || session.data?.user.email || (
                <span className="text-xs text-muted-foreground">N/A</span>
              )}
            </CardTitle>
          </div>
        </div>
        <CardAction>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => signOut.mutate()}
            loading={signOut.isPending || signOut.isSuccess}
          >
            <LogOutIcon />
            Logout
          </Button>
        </CardAction>
      </CardHeader>

      <AccountCardRow label="Name" className="group">
        <p className="flex-1 truncate underline-offset-4 group-hover:underline">
          {session.data?.user.name || (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </p>
        <ChangeNameDrawer>
          <button type="button" className="cursor-pointer">
            <Button asChild variant="ghost" size="icon-sm" className="-my-1.5">
              <span>
                <PenLineIcon />
                <span className="sr-only">Change your name</span>
              </span>
            </Button>
            <span className="absolute inset-0" />
          </button>
        </ChangeNameDrawer>
      </AccountCardRow>
      <AccountCardRow label="Email" className="group">
        <p className="flex-1 truncate underline-offset-4 group-hover:underline">
          {!session.data?.user.emailVerified && (
            <Badge size="sm" variant="warning" className="me-2">
              Not Verified
            </Badge>
          )}
          {session.data?.user.email || (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </p>
        <ChangeEmailInitDrawer>
          <button type="button" className="cursor-pointer">
            <Button asChild variant="ghost" size="icon-sm" className="-my-1.5">
              <span>
                <PenLineIcon />
                <span className="sr-only">Change your email</span>
              </span>
            </Button>
            <span className="absolute inset-0" />
          </button>
        </ChangeEmailInitDrawer>
        <ChangeEmailVerifyDrawer />
      </AccountCardRow>
    </Card>
  );
};
