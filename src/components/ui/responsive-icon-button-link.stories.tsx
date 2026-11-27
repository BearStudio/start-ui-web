import type { Meta } from '@storybook/tanstack-react';
import { PlusIcon } from 'lucide-react';

import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

export default {
  title: 'ResponsiveIconButtonLink',
} satisfies Meta<typeof ResponsiveIconButtonLink>;

export function Default() {
  return (
    <ResponsiveIconButtonLink to="/" label="Add">
      <PlusIcon />
    </ResponsiveIconButtonLink>
  );
}

export function Sizes() {
  return (
    <div className="flex gap-4">
      <ResponsiveIconButtonLink to="/" label="Add" size="sm">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" size="default">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" size="lg">
        <PlusIcon />
      </ResponsiveIconButtonLink>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex gap-4">
      <ResponsiveIconButtonLink to="/" label="Add">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="secondary">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="ghost">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="destructive">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink
        to="/"
        label="Add"
        variant="destructive-secondary"
      >
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="link">
        <PlusIcon />
      </ResponsiveIconButtonLink>
    </div>
  );
}
