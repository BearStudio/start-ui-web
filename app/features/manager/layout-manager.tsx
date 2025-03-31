import { ReactNode } from 'react';

export const LayoutManager = (props: { children?: ReactNode }) => {
  return <>{props.children} (manager layout)</>;
};
