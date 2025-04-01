import { ReactNode } from 'react';

export const LayoutManager = (props: { children?: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-manager">
      {props.children} (manager layout)
    </div>
  );
};
