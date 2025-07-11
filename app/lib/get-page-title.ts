import { getEnvHintTitlePrefix } from '@/features/devtools/env-hint';

export const getPageTitle = (pageTitle?: string) =>
  pageTitle
    ? `${getEnvHintTitlePrefix()} ${pageTitle} | Start UI`
    : `${getEnvHintTitlePrefix()} Start UI`;
