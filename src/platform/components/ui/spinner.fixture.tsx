import { Spinner } from '@/platform/components/ui/spinner';
const Default = () => {
  return <Spinner />;
};

const Full = () => {
  return (
    <div className="flex h-48 w-full flex-1 flex-col">
      <Spinner full />
    </div>
  );
};

export default {
  Default,
  Full,
};
