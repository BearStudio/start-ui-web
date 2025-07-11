import { useTheme } from 'next-themes';
import { Toaster, ToasterProps } from 'sonner';

export const Sonner = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme === 'dark' ? 'dark' : 'light'}
      className="toaster group mt-safe-top"
      position="top-center"
      offset={{
        top: 'calc(16px + env(safe-area-inset-top))',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        left: 'calc(16px + env(safe-area-inset-left))',
        right: 'calc(16px + env(safe-area-inset-right))',
      }}
      mobileOffset={{
        top: 'calc(8px + env(safe-area-inset-top))',
        bottom: 'calc(8px + env(safe-area-inset-bottom))',
        left: 'calc(8px + env(safe-area-inset-left))',
        right: 'calc(8px + env(safe-area-inset-right))',
      }}
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
