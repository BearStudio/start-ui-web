import { LogOutIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';

import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

export const ConfirmLogout = (props: {
  children: ReactElement<{ onClick: () => unknown }>;
}) => {
  const session = authClient.useSession();
  return (
    <ConfirmResponsiveDrawer
      onConfirm={async () => {
        const response = await authClient.signOut();
        if (response.error) {
          toast.error('Failed to logout');
          return;
        }
        await session.refetch();
      }}
      title="Account logout"
      description="You are about to end your session"
      confirmText={
        <>
          <LogOutIcon />
          Logout
        </>
      }
    >
      {props.children}
    </ConfirmResponsiveDrawer>
  );
};
