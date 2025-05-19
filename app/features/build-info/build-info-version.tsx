import { useTranslation } from 'react-i18next';

import buildInfo from './build-info.gen.json';

export const BuildInfoVersion = () => {
  const { t } = useTranslation(['buildInfo']);
  return t('buildInfo:versionLabel', { version: buildInfo.display });
};
