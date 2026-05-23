export const getPageTitle = (pageTitle?: string, titlePrefix = '') =>
  pageTitle
    ? `${titlePrefix} ${pageTitle} | Start UI`
    : `${titlePrefix} Start UI`;
