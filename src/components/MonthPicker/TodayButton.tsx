import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useMonthPickerContext } from './MonthPickerContext';
import { useYearContext } from './YearContext';

export const TodayButton = () => {
  const { t } = useTranslation(['components']);
  const { setYear } = useYearContext();
  const { onTodayButtonClick } = useMonthPickerContext();

  const handleClick = () => {
    const currentYear = new Date().getFullYear();

    setYear(currentYear);
    onTodayButtonClick?.();
  };

  return (
    <Button
      width="full"
      variant="@secondary"
      fontWeight="500"
      onClick={handleClick}
      size="sm"
    >
      {t('components:monthPicker.today')}
    </Button>
  );
};
