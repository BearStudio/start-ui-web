import type { Meta } from '@storybook/react-vite';

import { Textarea } from '@/components/ui/textarea';

export default {
  title: 'Textarea',
} satisfies Meta<typeof Textarea>;

export const Default = () => {
  return <Textarea placeholder="Placeholder..." />;
};

export const Invalid = () => {
  return <Textarea aria-invalid placeholder="Placeholder..." />;
};

export const Disabled = () => {
  return <Textarea disabled placeholder="Placeholder..." />;
};

export const ReadOnly = () => {
  return <Textarea readOnly placeholder="Placeholder..." />;
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <Textarea size="sm" placeholder="Small" />
      <Textarea placeholder="Default" />
      <Textarea size="lg" placeholder="Large" />
    </div>
  );
};

export const MinHeight = () => {
  return (
    <div className="flex flex-col gap-4">
      <Textarea placeholder="Placeholder..." className="[&>textarea]:min-h-0" />
      <Textarea
        placeholder="Placeholder..."
        className="[&>textarea]:min-h-24"
      />
    </div>
  );
};

export const FixedHeight = () => {
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        placeholder="Placeholder..."
        className="[&>textarea]:max-h-32 [&>textarea]:min-h-32"
      />
    </div>
  );
};

export const MaxHeight = () => {
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        placeholder="Placeholder..."
        className="[&>textarea]:max-h-24"
      />
      <Textarea
        placeholder="Placeholder..."
        className="[&>textarea]:max-h-64"
      />
    </div>
  );
};
