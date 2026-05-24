export const getPageTitle = (pageTitle?: string, titlePrefix = '') =>
  pageTitle
    ? `${titlePrefix}${titlePrefix ? ' ' : ''}${pageTitle} | Start UI`
    : `${titlePrefix}${titlePrefix ? ' ' : ''}Start UI`;
