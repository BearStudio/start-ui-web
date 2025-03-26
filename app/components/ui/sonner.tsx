import { Toaster, ToasterProps } from 'sonner';

import { useTheme } from '@/lib/theme/client';
import { DEFAULT_THEME } from '@/lib/theme/config';

export const Sonner = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme ?? DEFAULT_THEME}
      className="toaster group mt-safe-top"
      position="top-right"
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
        },
      }}
      {...props}
    />
  );
};
