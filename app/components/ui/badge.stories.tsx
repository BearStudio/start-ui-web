import type { Meta } from '@storybook/react';

import { Badge } from '@/components/ui/badge';

export default {
  title: 'Badge',
} satisfies Meta<typeof Badge>;

export function Default() {
  return <Badge>Badge</Badge>;
}

export function Variants() {
  return (
    <div className="flex flex-wrap gap-4">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="negative">Negative</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap gap-4">
      <Badge>Default</Badge>
      <Badge size="sm">Small</Badge>
    </div>
  );
}
