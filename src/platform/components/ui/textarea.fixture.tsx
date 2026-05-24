import { Textarea } from '@/platform/components/ui/textarea';
const Default = () => {
  return <Textarea placeholder="Placeholder..." />;
};

const Invalid = () => {
  return <Textarea aria-invalid placeholder="Placeholder..." />;
};

const Disabled = () => {
  return <Textarea disabled placeholder="Placeholder..." />;
};

const ReadOnly = () => {
  return <Textarea readOnly placeholder="Placeholder..." />;
};

const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <Textarea size="sm" placeholder="Small" />
      <Textarea placeholder="Default" />
      <Textarea size="lg" placeholder="Large" />
    </div>
  );
};

const MinHeight = () => {
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

const FixedHeight = () => {
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        placeholder="Placeholder..."
        className="[&>textarea]:max-h-32 [&>textarea]:min-h-32"
      />
    </div>
  );
};

const MaxHeight = () => {
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

export default {
  Default,
  Invalid,
  Disabled,
  ReadOnly,
  Sizes,
  MinHeight,
  FixedHeight,
  MaxHeight,
};
