import {
  QueryClient,
  QueryClientProvider as Provider,
} from '@tanstack/react-query';
import { ReactNode } from 'react';

export const QueryClientProvider = (props: {
  children?: ReactNode;
  client: QueryClient;
}) => {
  return <Provider client={props.client}>{props.children}</Provider>;
};
