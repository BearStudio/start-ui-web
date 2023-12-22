import { IconButton } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { useRtl } from '@/hooks/useRtl';

export type AdminBackButtonProps = {
  withConfrim?: boolean;
};

export const AdminBackButton = (props: AdminBackButtonProps) => {
  const router = useRouter();
  const { t } = useTranslation(['common']);
  const { rtlValue } = useRtl();
  return (
    <ConfirmModal
      onConfirm={() => router.back()}
      size="lg"
      isEnabled={props.withConfrim ?? false}
      title={t('common:confirmDiscardChanges.title')}
      message={t('common:confirmDiscardChanges.message')}
      confirmVariant="@dangerSecondary"
      confirmText={t('common:confirmDiscardChanges.confirmText')}
      cancelText={t('common:confirmDiscardChanges.cancelText')}
    >
      <IconButton
        aria-label={t('common:actions.back')}
        icon={rtlValue(<LuArrowLeft />, <LuArrowRight />)}
      />
    </ConfirmModal>
  );
};
