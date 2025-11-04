import { LogOutIcon, PenLineIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';

import { AccountCardRow } from '@/features/account/account-card-row';
import { ChangeNameDrawer } from '@/features/account/change-name-drawer';
import { authClient } from '@/features/auth/client';
import { ConfirmSignOut } from '@/features/auth/confirm-signout';

export const UserCard = () => {
  const { t } = useTranslation(['auth', 'account']);
  const session = authClient.useSession();
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
                <span className="text-xs text-muted-foreground">--</span>
              )}
            </CardTitle>
          </div>
        </div>
        <CardAction>
          <ConfirmSignOut>
            <Button size="sm" variant="ghost">
              <LogOutIcon />
              {t('auth:signOut.action')}
            </Button>
          </ConfirmSignOut>
        </CardAction>
      </CardHeader>

      <AccountCardRow label={t('account:userCard.name.label')}>
        <div className="flex gap-1">
          <p className="truncate underline-offset-4">
            {session.data?.user.name || (
              <span className="text-xs text-muted-foreground">--</span>
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
                  <span className="sr-only">
                    {t('account:userCard.name.updateAction')}
                  </span>
                </span>
              </Button>
              <span className="absolute inset-0" />
            </button>
          </ChangeNameDrawer>
        </div>
      </AccountCardRow>
      <AccountCardRow label={t('account:userCard.email.label')}>
        <p className="flex-1 truncate underline-offset-4">
          {!session.data?.user.emailVerified && (
            <Badge size="sm" variant="warning" className="me-2">
              {t('account:userCard.email.notVerified')}
            </Badge>
          )}
          {session.data?.user.email || (
            <span className="text-xs text-muted-foreground">--</span>
          )}
        </p>
      </AccountCardRow>
    </Card>
  );
};
