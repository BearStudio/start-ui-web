import { MailIcon } from 'lucide-react';

import { Badge } from '@/platform/components/ui/badge';
const Default = () => {
  return (
    <div>
      <Badge>Default</Badge>
    </div>
  );
};

const Variants = () => {
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

const Sizes = () => {
  return (
    <div className="flex gap-4">
      <Badge size="xs">Extra Small</Badge>
      <Badge size="sm">Small</Badge>
      <Badge>Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  );
};

const AsLink = () => {
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

const IconOnly = () => {
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

const WithIcon = () => {
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

export default {
  Default,
  Variants,
  Sizes,
  AsLink,
  IconOnly,
  WithIcon,
};
