import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ConfirmResponsiveDrawer } from '@/platform/components/ui/confirm-responsive-drawer';

import { signOut } from './client';
import { clearAllQueryStateForAuthBoundary } from './queries';

export const ConfirmSignOut = (props: {
  children: ReactElement<{ onClick: () => unknown }>;
}) => {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <ConfirmResponsiveDrawer
      onConfirm={async () => {
        const response = await signOut();
        if (!response.ok) {
          toast.error(response.message ?? response.code);
          return;
        }

        clearAllQueryStateForAuthBoundary(queryClient);
        await navigate({
          to: '/',
        });
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
