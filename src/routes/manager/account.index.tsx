import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/platform/components/ui/button';

import {
  BuildInfoDrawer,
  BuildInfoVersion,
} from '@/app/build-info/presentation';
import { ManagerPageAccount as PageAccount } from '@/modules/account/presentation';

export const Route = createFileRoute('/manager/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageAccount
      supportSlot={
        <BuildInfoDrawer>
          <Button variant="ghost" size="xs" className="opacity-60">
            <BuildInfoVersion />
          </Button>
        </BuildInfoDrawer>
      }
    />
  );
}
