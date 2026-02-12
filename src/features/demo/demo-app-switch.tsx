import { Link, useMatchRoute } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';

export const DemoAppSwitch = () => {
  const { t } = useTranslation(['demo']);
  const session = authClient.useSession();
  const userRole = session.data?.user.role;
  const matchRoute = useMatchRoute();
  const currentApp = matchRoute({ to: '/manager', fuzzy: true })
    ? 'manager'
    : 'app';

  const hasAppAccess = authClient.admin.checkRolePermission({
    role: userRole as Role,
    permission: {
      apps: ['app'],
    },
  });

  const hasManagerAccess = authClient.admin.checkRolePermission({
    role: userRole as Role,
    permission: {
      apps: ['manager'],
    },
  });

  return (
    <div className="flex gap-4 max-xs:flex-col">
      <Link to="/app" className="flex flex-1 flex-col" disabled={!hasAppAccess}>
        <Card
          className={cn(
            'flex-1',
            currentApp === 'app' &&
              'ring-2 ring-offset-2 ring-offset-background',
            !hasAppAccess && 'cursor-not-allowed'
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{t('demo:appSwitch.app.title')}</CardTitle>
              {currentApp === 'app' && (
                <Badge size="sm">{t('demo:appSwitch.youAreHere')}</Badge>
              )}
              {!hasAppAccess && (
                <Badge size="sm" variant="secondary">
                  {t('demo:appSwitch.noAccess')}
                </Badge>
              )}
            </div>
            {currentApp !== 'app' && hasAppAccess && (
              <CardAction className="-m-2">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<div />}
                  nativeButton={false}
                >
                  {t('demo:appSwitch.app.goTo')}
                  <ArrowRightIcon />
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('demo:appSwitch.app.description')}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
      <Link
        to="/manager"
        className="flex flex-1 flex-col"
        disabled={!hasManagerAccess}
      >
        <Card
          className={cn(
            'flex-1',
            currentApp === 'manager' &&
              'ring-2 ring-offset-2 ring-offset-background',
            !hasManagerAccess && 'cursor-not-allowed'
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{t('demo:appSwitch.manager.title')}</CardTitle>
              {currentApp === 'manager' && (
                <Badge size="sm">{t('demo:appSwitch.youAreHere')}</Badge>
              )}
              {!hasManagerAccess && (
                <Badge size="sm" variant="secondary">
                  {t('demo:appSwitch.noAccess')}
                </Badge>
              )}
            </div>

            {currentApp !== 'manager' && hasManagerAccess && (
              <CardAction className="-m-2">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<div />}
                  nativeButton={false}
                >
                  {t('demo:appSwitch.manager.goTo')}
                  <ArrowRightIcon />
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('demo:appSwitch.manager.description')}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};
