import { LogOutIcon, PenLineIcon } from 'lucide-react';

import { authClient } from '@/lib/auth/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';

import { AccountCardRow } from '@/features/account/account-card-row';
import { useSignOut } from '@/features/auth/utils';

export const AccountUserCard = () => {
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

      <AccountCardRow label="Name">
        <p className="flex-1 truncate">
          {session.data?.user.name || (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </p>
        <Button variant="ghost" size="icon-sm" className="-my-1.5">
          <PenLineIcon />
          <span className="sr-only">Modify</span>
          <span className="absolute inset-0" />
        </Button>
      </AccountCardRow>
      <AccountCardRow label="Email">
        <p className="flex-1 truncate">
          {!session.data?.user.emailVerified && (
            <Badge size="sm" variant="warning" className="me-2">
              Not Verified
            </Badge>
          )}
          {session.data?.user.email || (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </p>
        <Button variant="ghost" size="icon-sm" className="-my-1.5">
          <PenLineIcon />
          <span className="sr-only">Modify</span>
          <span className="absolute inset-0" />
        </Button>
      </AccountCardRow>
    </Card>
  );
};
