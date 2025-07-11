import React, { ReactElement } from 'react';

import * as icons from './generated';

export default {
  title: 'Icons/Custom',
};

export const AllIcons = () => (
  <div className="grid auto-cols-max grid-flow-col gap-2">
    {Object.entries(icons).map(([name, Icon]) => (
      <CustomIcon name={name} key={name}>
        <Icon />
      </CustomIcon>
    ))}
  </div>
);

const CustomIcon = ({
  children,
  name,
}: {
  children: ReactElement;
  name: string;
}) => {
  return (
    <button
      type="button"
      title={name}
      className="text-4xl text-neutral-600 dark:text-neutral-300"
    >
      {children}
    </button>
  );
};
