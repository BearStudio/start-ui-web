import { HStack, Text } from '@chakra-ui/react';

import { Navbar } from '@/components/DayPicker/_partials/Navbar';

import { useYearContext } from './YearContext';

export const MonthCaption = () => {
  const { year, setYear } = useYearContext();

  const handlePreviousClick = () => setYear((prevYear) => prevYear - 1);
  const handleNextClick = () => setYear((prevYear) => prevYear + 1);

  return (
    <HStack justifyContent="space-between">
      <Text
        fontWeight="700"
        color="gray.600"
        fontSize="sm"
        _dark={{ color: 'white' }}
      >
        {year}
      </Text>
      <Navbar
        onPreviousClick={handlePreviousClick}
        onNextClick={handleNextClick}
      />
    </HStack>
  );
};
