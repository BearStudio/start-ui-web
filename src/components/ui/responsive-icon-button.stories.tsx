import type { Meta } from '@storybook/react-vite';
import { PlusIcon } from 'lucide-react';

import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

export default {
  title: 'ResponsiveIconButton',
} satisfies Meta<typeof ResponsiveIconButton>;

export function Default() {
  return (
    <ResponsiveIconButton label="Add">
      <PlusIcon />
    </ResponsiveIconButton>
  );
}

export function Sizes() {
  return (
    <div className="flex gap-4">
      <ResponsiveIconButton label="Add" size="sm">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" size="default">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" size="lg">
        <PlusIcon />
      </ResponsiveIconButton>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex gap-4">
      <ResponsiveIconButton label="Add">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" variant="secondary">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" variant="ghost">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" variant="destructive">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" variant="destructive-secondary">
        <PlusIcon />
      </ResponsiveIconButton>
      <ResponsiveIconButton label="Add" variant="link">
        <PlusIcon />
      </ResponsiveIconButton>
    </div>
  );
}

export function Render() {
  return (
    <ResponsiveIconButton
      label="Add"
      render={<a href="/" />}
      nativeButton={false}
    >
      <PlusIcon />
    </ResponsiveIconButton>
  );
}
