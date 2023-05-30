import React from 'react';

import { LuPlus } from 'react-icons/lu';

import { ResponsiveIconButton } from '.';

export default {
  title: 'components/ResponsiveIconButton',
};

export const Default = () => (
  <ResponsiveIconButton icon={<LuPlus />}>Add something</ResponsiveIconButton>
);

export const WithCustomBreakpoints = () => (
  <ResponsiveIconButton
    hideTextBreakpoints={{
      base: true,
      sm: false,
      md: true,
      lg: false,
      xl: true,
    }}
    icon={<LuPlus />}
  >
    Add something
  </ResponsiveIconButton>
);
