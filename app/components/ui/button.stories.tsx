import type { Meta } from '@storybook/react';
import { Mail } from 'lucide-react';

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

export const AsChild = () => {
  return (
    <Button asChild>
      <a href="#">Anchor as child</a>
    </Button>
  );
};

export const IconOnly = () => {
  return (
    <div className="flex gap-4">
      <Button size="icon-xs">
        <Mail />
      </Button>
      <Button size="icon-sm">
        <Mail />
      </Button>
      <Button size="icon">
        <Mail />
      </Button>
      <Button size="icon-lg">
        <Mail />
      </Button>
    </div>
  );
};

export const WithIcon = () => {
  return (
    <div className="flex gap-4">
      <Button>
        <Mail />
        Button
      </Button>
      <Button>
        Button
        <Mail />
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
          <Mail />
        </Button>
        <Button loading>
          <Mail />
          Button
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary" loading>
          Button
        </Button>
        <Button variant="secondary" size="icon" loading>
          <Mail />
        </Button>
        <Button variant="secondary" loading>
          <Mail />
          Button
        </Button>
      </div>
    </div>
  );
};
