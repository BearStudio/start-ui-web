import { Button } from '@chakra-ui/react';

import { useMonthPickerContext } from './MonthPickerContext';
import { useYearContext } from './YearContext';

export const TodayButton = () => {
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
      Aujourd'hui
    </Button>
  );
};
