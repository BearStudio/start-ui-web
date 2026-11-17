import type { Meta } from '@storybook/react-vite';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { AnchorButton } from '@/components/ui/anchor-button';

export default {
  title: 'AnchorButton',
} satisfies Meta<typeof AnchorButton>;

// A plain `<a>` with the look of a button, for a link whose `href` comes from elsewhere (a store of `DataTable`). For
// a route of the app, use `ButtonLink`.
export const Default = () => {
  return (
    <div className="flex gap-2">
      <AnchorButton href="#previous" variant="ghost" size="sm" disabled>
        <ChevronLeftIcon />
        Previous
      </AnchorButton>
      <AnchorButton href="#1" variant="secondary" size="number">
        1
      </AnchorButton>
      <AnchorButton href="#2" variant="ghost" size="number">
        2
      </AnchorButton>
      <AnchorButton href="#next" variant="ghost" size="sm">
        Next
        <ChevronRightIcon />
      </AnchorButton>
    </div>
  );
};
