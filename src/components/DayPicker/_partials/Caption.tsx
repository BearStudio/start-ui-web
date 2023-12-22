import { Button, HStack, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { CaptionProps, useNavigation } from 'react-day-picker';

import { Navbar } from '@/components/DayPicker/_partials/Navbar';

type CustomCaptionElementProps = CaptionProps & {
  setMonth(date?: Date): void;
  onCaptionLabelClick?(): void;
  withMonthPicker?: boolean;
};

export const Caption: React.FC<
  React.PropsWithChildren<CustomCaptionElementProps>
> = ({
  displayMonth,
  onCaptionLabelClick,
  setMonth,
  withMonthPicker = true,
}) => {
  const { previousMonth, nextMonth } = useNavigation();

  const monthText = `${dayjs(displayMonth).format(
    'MMMM'
  )} ${displayMonth.getFullYear()}`;

  return (
    <HStack justifyContent="space-between">
      {withMonthPicker ? (
        <Button
          size="sm"
          onClick={() => onCaptionLabelClick?.()}
          textTransform="capitalize"
        >
          {monthText}
        </Button>
      ) : (
        <Text
          fontWeight="medium"
          color="gray.600"
          fontSize="sm"
          textTransform="capitalize"
        >
          {monthText}
        </Text>
      )}
      <Navbar
        onPreviousClick={() => setMonth(previousMonth)}
        onNextClick={() => setMonth(nextMonth)}
      />
    </HStack>
  );
};
