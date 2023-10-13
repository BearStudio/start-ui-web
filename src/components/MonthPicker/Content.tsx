import {
  Button,
  Grid,
  GridItem,
  GridProps,
  HTMLChakraProps,
} from '@chakra-ui/react';

import { MonthCaption } from './MonthCaption';
import { useMonthPickerContext } from './MonthPickerContext';
import { TodayButton } from './TodayButton';
import { useYearContext } from './YearContext';
import months from './months';

type ContentProps = GridProps;

export const Content: React.FC<React.PropsWithChildren<ContentProps>> = () => {
  const { year } = useYearContext();
  const { onMonthClick, selectedMonths } = useMonthPickerContext();

  const handleClick = (month: number) => {
    onMonthClick?.(new Date(year, month));
  };

  const isSelected = (date: Date): boolean =>
    !!selectedMonths?.some(
      (month) =>
        month.getFullYear() === date.getFullYear() &&
        month.getMonth() === date.getMonth()
    );

  const isToday = (date: Date): boolean => {
    const today = new Date();

    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth()
    );
  };

  const selectedStyle: HTMLChakraProps<'button'> = {
    color: 'white',
    bg: 'brand.600',
    _hover: {
      bg: 'brand.700',
    },
    _active: {
      bg: 'brand.800',
    },
    _focusVisible: {
      boxShadow: 'outline-brand',
    },
  };

  const todayStyle: HTMLChakraProps<'button'> = {
    textDecoration: 'underline',
  };

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={3} p={4}>
      <GridItem colSpan={3}>
        <MonthCaption />
      </GridItem>

      {months.map((month, index) => {
        const monthAsDate = new Date(year, index);
        return (
          <Button
            textTransform="capitalize"
            key={month}
            fontSize="sm"
            fontWeight="500"
            onClick={() => handleClick(index)}
            size="sm"
            {...(isSelected(monthAsDate) ? selectedStyle : {})}
            {...(isToday(monthAsDate) ? todayStyle : {})}
          >
            {month}
          </Button>
        );
      })}
      <GridItem colSpan={3}>
        <TodayButton />
      </GridItem>
    </Grid>
  );
};
