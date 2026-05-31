import { createFileRoute } from '@tanstack/react-router';

import { BuildInfoDrawer } from '@/app/build-info/presentation';
import { BuildInfoVersion } from '@/app/build-info/presentation';
import { AppPageAccount as PageAccount } from '@/modules/account/presentation';
import { Button } from '@/platform/components/ui/button';

export const Route = createFileRoute('/app/account/')({
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
