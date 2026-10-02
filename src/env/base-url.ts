/* oxlint-disable node/no-process-env */

// Kept free of `createEnv` so it can be imported where env validation must not
// run (e.g. the react-email preview server).
export const envMetaOrProcess: Record<string, string> =
  import.meta.env ?? process.env;

export const getBaseUrl = () => {
  const vercelUrlPreviewUrl =
    envMetaOrProcess.VITE_VERCEL_ENV === 'preview'
      ? envMetaOrProcess.VITE_VERCEL_BRANCH_URL
      : null;

  if (vercelUrlPreviewUrl) {
    return `https://${vercelUrlPreviewUrl}`;
  }

  return envMetaOrProcess.VITE_BASE_URL;
};
