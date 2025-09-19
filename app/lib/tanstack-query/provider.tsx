import { QueryClientProvider as Provider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { queryClient } from './query-client';

export const QueryClientProvider = (props: { children?: ReactNode }) => {
  return <Provider client={queryClient}>{props.children}</Provider>;
};
