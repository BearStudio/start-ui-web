export const getPageTitle = (pageTitle?: string, titlePrefix = '') => {
  const prefix = titlePrefix ? `${titlePrefix} ` : '';
  return pageTitle ? `${prefix}${pageTitle} | Start UI` : `${prefix}Start UI`;
};
