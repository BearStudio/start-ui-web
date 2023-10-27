import React, { RefObject, forwardRef } from 'react';

import { Box, Button, Portal } from '@chakra-ui/react';
import fr from 'date-fns/locale/fr';
import dayjs from 'dayjs';
import {
  DayModifiers,
  ModifiersStyles,
  DayPicker as ReactDayPicker,
} from 'react-day-picker';
import FocusLock from 'react-focus-lock';
import { useTranslation } from 'react-i18next';

import { DayPickerProps } from '@/components/DayPicker';
import { Caption, Day } from '@/components/DayPicker/_partials';
import {
  DEFAULT_MODIFIERS,
  DEFAULT_MODIFIERS_STYLES,
} from '@/components/DayPicker/constants';
import { useDayPickerCalendarFocusController } from '@/components/DayPicker/hooks/useDayPickerCalendarFocusController';
import { UseDayPickerMonthNavigationValue } from '@/components/DayPicker/hooks/useDayPickerMonthNavigation';
import { UseDayPickerPopperManagementValue } from '@/components/DayPicker/hooks/useDayPickerPopperManagement';
import { MonthPicker } from '@/components/MonthPicker';

type DayPickerContentProps = {
  isCalendarFocused: boolean;
  setIsCalendarFocused: (value: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement>;
  hookMonthNavigation: UseDayPickerMonthNavigationValue;
  handleSelectMonth: (date: Date) => void;
  handleChangeMonth: (date?: Date) => void;
  handleDaySelect: (date?: Date) => void;
  handleOnTapEnter: () => void;
  value?: Date;
  popperManagement: UseDayPickerPopperManagementValue;
} & Omit<DayPickerProps, 'onChange'>;

export const DayPickerContent = forwardRef<
  HTMLDivElement,
  DayPickerContentProps
>(
  (
    {
      isCalendarFocused,
      setIsCalendarFocused,
      buttonRef,
      hookMonthNavigation,
      handleSelectMonth,
      handleChangeMonth,
      handleOnTapEnter,
      dayPickerProps,
      handleDaySelect,
      value,
      popperManagement,
      arePastDaysDisabled = false,
      usePortal = true,
      required = false,
      hasTodayButton = true,
      ...rest
    }: DayPickerContentProps,
    ref
  ) => {
    const { t } = useTranslation(['components']);
    const { mode, toggleMode, month } = hookMonthNavigation;
    // Gestion des modifiers et leurs styles
    const modifiers: DayModifiers = {
      ...DEFAULT_MODIFIERS,
      ...dayPickerProps?.modifiers,
    };

    const modifiersStyles: ModifiersStyles = {
      ...DEFAULT_MODIFIERS_STYLES,
      ...dayPickerProps?.modifiersStyles,
    };

    const { popper, closePopper, isPopperOpen } = popperManagement;

    useDayPickerCalendarFocusController({
      isCalendarFocused,
      setIsCalendarFocused,
      closeCalendar: closePopper,
      onTapEnter: handleOnTapEnter,
    });

    const content = (
      <Box
        tabIndex={-1}
        style={popper.styles.popper}
        {...popper.attributes.popper}
        ref={ref}
        role="dialog"
        zIndex={2}
        minW={250}
      >
        <FocusLock
          disabled={!isCalendarFocused}
          onDeactivation={() => setTimeout(() => buttonRef.current?.focus(), 0)} // setTimeout recommandé par FocusLock
        >
          <Box
            shadow="md"
            bg="white"
            p={1}
            _dark={{
              bg: 'gray.800',
            }}
            {...rest}
          >
            {mode === 'DAY' ? (
              <>
                <ReactDayPicker
                  mode="single"
                  initialFocus={isCalendarFocused}
                  month={month ?? undefined}
                  onMonthChange={(date) => {
                    handleChangeMonth(date);
                  }}
                  selected={value}
                  onSelect={handleDaySelect}
                  components={{
                    Caption: (props) => (
                      <Caption
                        {...props}
                        onCaptionLabelClick={toggleMode}
                        setMonth={(date) => {
                          handleChangeMonth(date);
                        }}
                      />
                    ),
                    Day: (props) => <Day {...props} />,
                  }}
                  disabled={
                    arePastDaysDisabled
                      ? [
                          { before: dayjs().startOf('day').toDate() },
                          // TODO fix typage
                          ...((dayPickerProps?.disabled as Array<TODO>) || []),
                        ]
                      : dayPickerProps?.disabled
                  }
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  {...(hasTodayButton
                    ? {
                        footer: (
                          <Button
                            onClick={() =>
                              handleDaySelect(dayjs().startOf('day').toDate())
                            }
                            variant="@secondary"
                            size="sm"
                            w="full"
                            onBlur={() =>
                              isCalendarFocused ? undefined : closePopper()
                            } // fix le problème de tabulation qui ne reste pas bloqué sur la popper
                          >
                            {t('dayPicker.today')}
                          </Button>
                        ),
                      }
                    : {})}
                  locale={fr}
                  required={required}
                />
              </>
            ) : (
              <MonthPicker
                year={month?.getFullYear()}
                onMonthClick={handleSelectMonth}
                onTodayButtonClick={() =>
                  handleSelectMonth(dayjs().startOf('day').toDate())
                }
              />
            )}
          </Box>
        </FocusLock>
      </Box>
    );

    return (
      <>
        {isPopperOpen &&
          (usePortal ? <Portal>{content}</Portal> : <>{content}</>)}
      </>
    );
  }
);

DayPickerContent.displayName = 'DayPickerContent';
