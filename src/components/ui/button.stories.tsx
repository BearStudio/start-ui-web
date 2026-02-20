import type { Meta } from '@storybook/react-vite';
import { MailIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default {
  title: 'Button',
} satisfies Meta<typeof Button>;

export const Default = () => {
  return <Button>Default</Button>;
};

export const Variants = () => {
  return (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="destructive-secondary">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
};

export const Sizes = () => {
  return (
    <div className="flex gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
};

export const Render = () => {
  return (
    <Button
      render={
        <a
          href="https://start-ui.com/"
          target="_blank"
          rel="noopener noreferrer"
        />
      }
      nativeButton={false}
    >
      Render as Anchor
    </Button>
  );
};

export const IconOnly = () => {
  return (
    <div className="flex gap-4">
      <Button size="icon-xs">
        <MailIcon />
      </Button>
      <Button size="icon-sm">
        <MailIcon />
      </Button>
      <Button size="icon">
        <MailIcon />
      </Button>
      <Button size="icon-lg">
        <MailIcon />
      </Button>
    </div>
  );
};

export const WithIcon = () => {
  return (
    <div className="flex gap-4">
      <Button>
        <MailIcon />
        Button
      </Button>
      <Button>
        Button
        <MailIcon />
      </Button>
    </div>
  );
};

export const FixedWidth = () => {
  return (
    <div className="flex gap-4">
      <Button className="w-32">
        <MailIcon />
        <span className="truncate">Button</span>
      </Button>
      <Button className="w-32">
        <MailIcon />
        <span className="truncate">Button with a long label</span>
      </Button>
      <Button className="w-32">
        <MailIcon />
        <span className="flex-1 truncate text-left">Button</span>
      </Button>
      <Button className="w-32">
        <MailIcon />
        <span className="flex-1 truncate text-left">
          Button with a long label
        </span>
      </Button>
      <Button className="w-32">
        <span className="flex-1 truncate text-left">Button</span>
        <MailIcon />
      </Button>
      <Button className="w-32">
        <span className="flex-1 truncate text-left">
          Button with a long label
        </span>
        <MailIcon />
      </Button>
    </div>
  );
};

export const Loading = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button loading>Button</Button>
        <Button size="icon" loading>
          <MailIcon />
        </Button>
        <Button loading>
          <MailIcon />
          Button
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary" loading>
          Button
        </Button>
        <Button variant="secondary" size="icon" loading>
          <MailIcon />
        </Button>
        <Button variant="secondary" loading>
          <MailIcon />
          Button
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="link" loading>
          Button
        </Button>
        <Button variant="link" size="icon" loading>
          <MailIcon />
        </Button>
        <Button variant="link" loading>
          <MailIcon />
          Button
        </Button>
      </div>
    </div>
  );
};

export const Disabled = () => {
  return (
    <div className="flex gap-4">
      <Button disabled>Default</Button>
      <Button disabled variant="secondary">
        Secondary
      </Button>
      <Button disabled variant="destructive">
        Destructive
      </Button>
      <Button disabled variant="destructive-secondary">
        Destructive
      </Button>
      <Button disabled variant="ghost">
        Ghost
      </Button>
      <Button disabled variant="link">
        Link
      </Button>
    </div>
  );
};
