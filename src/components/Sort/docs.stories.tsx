import React, { useState } from 'react';

import { LuArrowDown, LuArrowUp } from 'react-icons/lu';

import { Icon } from '@/components/Icons';

import { Sort, SortValue } from '.';

export default {
  title: 'components/Sort',
};

const options = [
  { value: 'firstName', label: 'Long first name' },
  { value: 'lastName', label: 'Last name' },
  { value: 'email', label: 'Email' },
];

export const Default = () => {
  const [sort, setSort] = useState<SortValue>({
    by: 'firstName',
    order: 'desc',
  });

  return <Sort sort={sort} onChange={setSort} options={options} />;
};

export const AutoEllipse = () => {
  const [sort, setSort] = useState<SortValue>({
    by: 'firstName',
    order: 'desc',
  });

  return (
    <Sort sort={sort} onChange={setSort} options={options} maxWidth="5rem" />
  );
};

export const CustomIcons = () => {
  const [sortDesc, setSortDesc] = useState<SortValue>({
    by: 'firstName',
    order: 'desc',
  });
  const [sortAsc, setSortAsc] = useState<SortValue>({
    by: 'firstName',
    order: 'asc',
  });

  return (
    <>
      <Sort
        sort={sortDesc}
        onChange={setSortDesc}
        options={options}
        ascIcon={<Icon icon={LuArrowUp} />}
        descIcon={<Icon icon={LuArrowDown} />}
      />
      <Sort
        sort={sortAsc}
        onChange={setSortAsc}
        options={options}
        ascIcon={<Icon icon={LuArrowUp} />}
        descIcon={<Icon icon={LuArrowDown} />}
      />
    </>
  );
};
