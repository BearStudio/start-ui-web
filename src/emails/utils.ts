/* oxlint-disable node/no-process-env */
import { getBaseUrl } from '@/env/base-url';

const STATIC_DIR = '/static';

export const emailAssetSrc = (filename: string) => {
  const path = `${STATIC_DIR}/${filename}`;

  // The react-email preview server serves `src/emails/templates/static`
  if (process.env.EMAIL_PREVIEW === 'true') {
    return path;
  }

  const base = getBaseUrl()?.replace(/\/$/, '') ?? '';
  return base ? `${base}${path}` : path;
};
