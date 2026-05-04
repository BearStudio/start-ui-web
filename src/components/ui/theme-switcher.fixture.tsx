import { ThemeSwitcher } from '@/components/ui/theme-switcher';
const Default = () => {
  return <ThemeSwitcher />;
};

const IconOnly = () => {
  return <ThemeSwitcher iconOnly />;
};

export default {
  Default,
  IconOnly,
};
