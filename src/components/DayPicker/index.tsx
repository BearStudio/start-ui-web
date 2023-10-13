import React, { FC, useRef, useState } from 'react';

import {
  BoxProps,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Placement,
} from '@chakra-ui/react';
import { DayPickerProps as ReactDayPickerProps } from 'react-day-picker';
import { FiCalendar } from 'react-icons/fi';

import { DayPickerContent } from '@/components/DayPicker/_partials';
import { DATE_FORMAT } from '@/components/DayPicker/constants';
import { useDayPickerInputManagement } from '@/components/DayPicker/hooks/useDayPickerInputManagement';
import { useDayPickerMonthNavigation } from '@/components/DayPicker/hooks/useDayPickerMonthNavigation';
import { useDayPickerPopperManagement } from '@/components/DayPicker/hooks/useDayPickerPopperManagement';
import { Icon } from '@/components/Icons';

export type DayPickerNavigationMode = 'DAY' | 'MONTH';

const DEFAULT_DAY_PICKER_WIDTH = 180;

export type DayPickerProps = {
  id?: string;
  value?: Date;
  onChange(date?: Date): void;
  popperPlacement?: Placement;
  dateFormat?: string;
  placeholder?: string;
  inputProps?: Omit<InputProps, 'value' | 'onChange' | 'placeholder'> & {
    'data-test'?: string;
  };
  dayPickerProps?: ReactDayPickerProps;
  required?: boolean;
  arePastDaysDisabled?: boolean;
  hasTodayButton?: boolean;
  isDisabled?: boolean;
  usePortal?: boolean;
  autoFocus?: boolean;
  onClose?(day?: Date): void;
  onMonthChange?(date?: Date): void;
} & Omit<BoxProps, 'onChange'>;

export const DayPicker: FC<DayPickerProps> = ({
  id,
  value,
  onChange,
  onClose,
  popperPlacement = 'bottom-start',
  dateFormat = DATE_FORMAT,
  placeholder = 'JJ/MM/AAAA',
  inputProps = {},
  isDisabled = false,
  autoFocus = false,
  onMonthChange,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const size = inputProps?.size ?? 'sm';

  // Gestion du focus du DayPicker
  const [isCalendarFocused, setIsCalendarFocused] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  //Gestion du popper
  const onClosePopper = () => {
    onClose?.(value);
    setMode('DAY');
  };

  const popperManagement = useDayPickerPopperManagement({
    containerRef,
    popperPlacement,
    autoFocus,
    setIsCalendarFocused,
    buttonRef,
    onClosePopper,
    inputRef,
  });
  const { setPopperElement, togglePopper, openPopper, closePopper } =
    popperManagement;

  // Gestion de changement de value (DayPicker et Input)
  const onChangeInput = (newDate?: Date, updateMonth = false) => {
    onChange(newDate);
    if (updateMonth) {
      selectMonth(newDate);
    }
  };

  const { inputValue, setInputValue, handleInputChange, handleInputBlur } =
    useDayPickerInputManagement({
      dateValue: value,
      dateFormat,
      onChange: onChangeInput,
      preventBlurAction: isCalendarFocused,
    });

  const handleDaySelect = (date?: Date) => {
    setMonth(date);
    onChange(date ?? undefined);
    if (date) {
      closePopper();
    } else {
      setInputValue('');
    }
  };

  // Gestion du changement de mois
  const hookMonthNavigation = useDayPickerMonthNavigation(value);
  const { setMode, setMonth, selectMonth } = hookMonthNavigation;

  const handleChangeMonth = (date?: Date) => {
    onMonthChange?.(date);
    setMonth(date);
  };

  // Le select va faire basculer le calendrier en mode jour après sélection
  const handleSelectMonth = (date: Date) => {
    onMonthChange?.(date);
    selectMonth(date);
  };

  const valueRef = useRef(value);
  valueRef.current = value;

  // on ouvre automatiquement le calendrier au focus seulement si on a pas encore de valeur
  const manageOpenOnFocus = () => {
    if (!valueRef.current) {
      openPopper();
    }
  };

  return (
    // on override le data-test pour ne pas qu'il soit dupliqué entre InputGroup et Input
    // si on force la width de l'input, on veut que la width du groupe soit la même
    <InputGroup
      ref={containerRef}
      size={size}
      width={inputProps.width}
      maxW={DEFAULT_DAY_PICKER_WIDTH}
      data-test="day-picker-input-group'"
    >
      <Input
        ref={inputRef}
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        onBlur={(e) => handleInputBlur(e.target.value)}
        onFocus={() => manageOpenOnFocus()}
        isDisabled={isDisabled}
        autoFocus={autoFocus}
        data-test={inputProps?.['data-test'] ?? 'day-picker-input'}
        {...inputProps} // on veut que le style s'applique sur l'input (bg par exemple)
      />
      <InputRightElement zIndex={1}>
        <IconButton
          ref={buttonRef}
          aria-label="Toggle calendar"
          bg="transparent"
          _hover={{ bg: 'transparent', color: 'gray.500' }}
          _active={{ bg: 'transparent', color: 'gray.600' }}
          icon={<Icon icon={FiCalendar} />}
          size={size}
          p={0}
          isDisabled={isDisabled}
          color={isDisabled ? 'gray.300' : 'gray.400'}
          onClick={() => togglePopper(true)}
          borderStartRadius="none"
        />
      </InputRightElement>
      <DayPickerContent
        value={value}
        isCalendarFocused={isCalendarFocused}
        setIsCalendarFocused={setIsCalendarFocused}
        buttonRef={buttonRef}
        hookMonthNavigation={hookMonthNavigation}
        handleSelectMonth={handleSelectMonth}
        handleChangeMonth={handleChangeMonth}
        handleOnTapEnter={() => handleInputBlur(inputValue)}
        handleDaySelect={handleDaySelect}
        popperManagement={popperManagement}
        ref={setPopperElement}
        {...rest}
      />
    </InputGroup>
  );
};
