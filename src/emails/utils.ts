/* eslint-disable no-process-env */
/* oxlint-disable node/no-process-env */

const STATIC_DIR = '/static';

export const emailAssetSrc = (filename: string) => {
  const path = `${STATIC_DIR}/${filename}`;

  if (process.env.npm_lifecycle_event === 'email:dev') {
    return path;
  }

  const base = process.env.VITE_BASE_URL?.replace(/\/$/, '') ?? '';
  return base ? `${base}${path}` : path;
};
