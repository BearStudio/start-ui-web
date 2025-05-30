import { LogOutIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';

import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

export const ConfirmSignOut = (props: {
  children: ReactElement<{ onClick: () => unknown }>;
}) => {
  const { t } = useTranslation(['auth']);
  const session = authClient.useSession();
  return (
    <ConfirmResponsiveDrawer
      onConfirm={async () => {
        const response = await authClient.signOut();
        if (response.error) {
          toast.error(t('auth:signOut.confirm.errorMessage'));
          return;
        }
        await session.refetch();
      }}
      title={t('auth:signOut.confirm.title')}
      description={t('auth:signOut.confirm.description')}
      confirmText={
        <>
          <LogOutIcon />
          {t('auth:signOut.action')}
        </>
      }
    >
      {props.children}
    </ConfirmResponsiveDrawer>
  );
};
