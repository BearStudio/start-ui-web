import type { Meta } from '@storybook/react';
import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default {
  title: 'Input',
} satisfies Meta<typeof Input>;

export const Default = () => {
  return <Input placeholder="Placeholder..." />;
};

export const Invalid = () => {
  return <Input aria-invalid placeholder="Placeholder..." />;
};

export const Disabled = () => {
  return <Input disabled placeholder="Placeholder..." />;
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <Input size="sm" placeholder="Placeholder..." />
      <Input placeholder="Placeholder..." />
      <Input size="lg" placeholder="Placeholder..." />
    </div>
  );
};

export const StartEndElements = () => {
  return (
    <div className="flex flex-col gap-4">
      <Input
        startElement={<Mail />}
        defaultValue="Icon start"
        placeholder="Placeholder..."
      />
      <Input
        endElement={<Mail />}
        defaultValue="Icon end"
        placeholder="Placeholder..."
      />
      <Input
        startElement={<Mail />}
        endElement={<Mail />}
        defaultValue="Icon start and end"
        placeholder="Placeholder..."
      />
      <Input
        startElement="https://"
        defaultValue="Text start"
        placeholder="Placeholder..."
      />
      <Input
        endElement=".com"
        defaultValue="Text end"
        placeholder="Placeholder..."
      />
    </div>
  );
};

export const InputAndButton = () => {
  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          alert('submitted');
        }}
      >
        <Input placeholder="Placeholder..." />
        <Button type="submit">Submit</Button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert('submitted');
        }}
      >
        <Input
          className="pr-1"
          placeholder="Placeholder..."
          endElement={
            <Button type="submit" size="xs" className="-mr-1.5">
              Submit
            </Button>
          }
        />
      </form>
    </div>
  );
};
