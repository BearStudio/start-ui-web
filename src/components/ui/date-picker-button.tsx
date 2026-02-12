import { CalendarIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

export type DatePickerButtonProps = ComponentProps<typeof Button>;

export const DatePickerButton = ({
  className,
  children,
  ...props
}: DatePickerButtonProps) => {
  const { t } = useTranslation(['components']);
  return (
    <Button
      variant="secondary"
      className={cn(
        'w-full max-w-60 justify-start text-left font-normal',
        !children && 'text-muted-foreground',
        className
      )}
      {...props}
    >
      <CalendarIcon />
      {children ?? t('components:datePickerButton.pickADate')}
    </Button>
  );
};
