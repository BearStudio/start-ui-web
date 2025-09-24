import { Block } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const PreventNavigation = (props: { shouldBlock: boolean }) => {
  const { t } = useTranslation(['components']);
  return (
    <Block
      shouldBlockFn={() => {
        if (!props.shouldBlock) return false;
        const shouldLeave = confirm(
          t('components:preventNavigation.confirmLabel')
        );
        return !shouldLeave;
      }}
      withResolver
      enableBeforeUnload={props.shouldBlock}
    />
  );
};
