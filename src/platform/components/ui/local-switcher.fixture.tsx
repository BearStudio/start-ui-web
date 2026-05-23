import { LocalSwitcher } from '@/platform/components/ui/local-switcher';
const Default = () => {
  return <LocalSwitcher />;
};

const IconOnly = () => {
  return <LocalSwitcher iconOnly />;
};

export default {
  Default,
  IconOnly,
};
