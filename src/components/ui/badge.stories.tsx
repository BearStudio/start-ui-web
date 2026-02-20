import type { Meta } from '@storybook/react-vite';
import { MailIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export default {
  title: 'Badge',
} satisfies Meta<typeof Badge>;

export const Default = () => {
  return (
    <div>
      <Badge>Default</Badge>
    </div>
  );
};

export const Variants = () => {
  return (
    <div className="flex gap-4">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="negative">Negative</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="positive">Positive</Badge>
    </div>
  );
};

export const Sizes = () => {
  return (
    <div className="flex gap-4">
      <Badge size="xs">Extra Small</Badge>
      <Badge size="sm">Small</Badge>
      <Badge>Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  );
};

export const AsLink = () => {
  return (
    <div>
      <Badge
        render={
          <a
            href="https://start-ui.com/"
            target="_blank"
            rel="noopener noreferrer"
          />
        }
      >
        Anchor as badge
      </Badge>
    </div>
  );
};

export const IconOnly = () => {
  return (
    <div className="flex gap-4">
      <Badge size="icon-xs">
        <MailIcon />
      </Badge>
      <Badge size="icon-sm">
        <MailIcon />
      </Badge>
      <Badge size="icon">
        <MailIcon />
      </Badge>
      <Badge size="icon-lg">
        <MailIcon />
      </Badge>
    </div>
  );
};

export const WithIcon = () => {
  return (
    <div className="flex gap-4">
      <Badge>
        <MailIcon />
        Badge
      </Badge>
      <Badge>
        Badge
        <MailIcon />
      </Badge>
    </div>
  );
};
