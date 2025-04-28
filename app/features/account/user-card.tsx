import { LogOutIcon, PenLineIcon } from 'lucide-react';

import { authClient } from '@/lib/auth/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

import { AccountCardRow } from '@/features/account/account-card-row';
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
          <ConfirmResponsiveDrawer
            onConfirm={async () => signOut.mutateAsync()}
            title="Account logout"
            description="You are about to end your session"
            confirmText={
              <>
                <LogOutIcon />
                Logout
              </>
            }
          >
            <Button
              size="sm"
              variant="ghost"
              loading={signOut.isPending || signOut.isSuccess}
            >
              <LogOutIcon />
              Logout
            </Button>
          </ConfirmResponsiveDrawer>
        </CardAction>
      </CardHeader>

      <AccountCardRow label="Name">
        <div className="flex gap-1">
          <p className="truncate underline-offset-4">
            {session.data?.user.name || (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </p>
          <ChangeNameDrawer>
            <button type="button" className="cursor-pointer">
              <Button
                asChild
                variant="ghost"
                size="icon-xs"
                className="-my-1.5"
              >
                <span>
                  <PenLineIcon />
                  <span className="sr-only">Update your name</span>
                </span>
              </Button>
              <span className="absolute inset-0" />
            </button>
          </ChangeNameDrawer>
        </div>
      </AccountCardRow>
      <AccountCardRow label="Email">
        <p className="flex-1 truncate underline-offset-4">
          {!session.data?.user.emailVerified && (
            <Badge size="sm" variant="warning" className="me-2">
              Not Verified
            </Badge>
          )}
          {session.data?.user.email || (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </p>
      </AccountCardRow>
    </Card>
  );
};
