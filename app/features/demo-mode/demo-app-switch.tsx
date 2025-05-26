import { Link, useMatchRoute } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';

import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Role } from '@/features/auth/permissions';

export const DemoAppSwitch = () => {
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
      <Link to="/app" className="flex-1" disabled={!hasAppAccess}>
        <Card
          className={cn(
            currentApp === 'app' && 'ring-2 ring-offset-2',
            !hasAppAccess && 'cursor-not-allowed'
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>App</CardTitle>
              {currentApp === 'app' && <Badge size="sm">You are here</Badge>}
              {!hasAppAccess && (
                <Badge size="sm" variant="secondary">
                  No Access
                </Badge>
              )}
            </div>
            <CardDescription>Simple mobile first app</CardDescription>
            {currentApp !== 'app' && hasAppAccess && (
              <CardAction className="-m-2">
                <Button variant="ghost" size="sm" asChild>
                  <div>
                    Go to /app
                    <ArrowRightIcon />
                  </div>
                </Button>
              </CardAction>
            )}
          </CardHeader>
        </Card>
      </Link>
      <Link to="/manager" className="flex-1" disabled={!hasManagerAccess}>
        <Card
          className={cn(
            currentApp === 'manager' && 'ring-2 ring-offset-2',
            !hasManagerAccess && 'cursor-not-allowed'
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Manager</CardTitle>
              {currentApp === 'manager' && (
                <Badge size="sm">You are here</Badge>
              )}
              {!hasManagerAccess && (
                <Badge size="sm" variant="secondary">
                  No Access
                </Badge>
              )}
            </div>
            <CardDescription>Advanced admin like app</CardDescription>
            {currentApp !== 'manager' && hasManagerAccess && (
              <CardAction className="-m-2">
                <Button variant="ghost" size="sm" asChild>
                  <div>
                    Go to /manager
                    <ArrowRightIcon />
                  </div>
                </Button>
              </CardAction>
            )}
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
};
