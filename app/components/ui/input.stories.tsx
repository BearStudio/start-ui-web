import type { Meta } from '@storybook/react-vite';
import { MailIcon } from 'lucide-react';

import { onSubmit } from '@/components/form/docs.utils';
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

export const ReadOnly = () => {
  return <Input readOnly placeholder="Placeholder..." />;
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
        startElement={<MailIcon />}
        defaultValue="Icon start"
        placeholder="Placeholder..."
      />
      <Input
        endElement={<MailIcon />}
        defaultValue="Icon end"
        placeholder="Placeholder..."
      />
      <Input
        startElement={<MailIcon />}
        endElement={<MailIcon />}
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
          onSubmit('Submitted');
        }}
      >
        <Input placeholder="Placeholder..." />
        <Button type="submit">Submit</Button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit('Submitted');
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
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit('Submitted');
        }}
      >
        <Input size="sm" placeholder="Placeholder..." />
        <Button size="sm" type="submit">
          Submit
        </Button>
      </form>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit('Submitted');
        }}
      >
        <Input size="lg" placeholder="Placeholder..." />
        <Button size="lg" type="submit">
          Submit
        </Button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit('Submitted');
        }}
      >
        <Input
          className="pr-1"
          placeholder="Placeholder..."
          size="lg"
          endElement={
            <Button type="submit" size="sm" className="-mr-2">
              Submit
            </Button>
          }
        />
      </form>
    </div>
  );
};
