import { Button } from '@/components/ui/button';
import type { Meta } from '@storybook/react';
import { Mail } from 'lucide-react';

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
    </div>
  );
};

export const Sizes = () => {
  return (
    <div className="flex gap-4">
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
