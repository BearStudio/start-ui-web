import { useState } from 'react';

import { DayPickerNavigationMode } from '@/components/DayPicker';

export type UseDayPickerMonthNavigationValue = {
  mode: DayPickerNavigationMode;
  setMode: (value: DayPickerNavigationMode) => void;
  toggleMode: () => void;
  month?: Date;
  setMonth: (value?: Date) => void;
  selectMonth: (value?: Date) => void;
};

/**
 * Ce hook permet de gérer la navigation entre les mois dans les DayPicker
 */
export const useDayPickerMonthNavigation = (
  date: Date = new Date()
): UseDayPickerMonthNavigationValue => {
  const [mode, setMode] = useState<DayPickerNavigationMode>('DAY');

  const toggleMode = () =>
    setMode((previousMode) => (previousMode === 'MONTH' ? 'DAY' : 'MONTH'));

  const [month, setMonth] = useState<Date | undefined>(date);

  const selectMonth = (date?: Date) => {
    setMonth(date);
    setMode('DAY');
  };

  return { mode, setMode, toggleMode, month, setMonth, selectMonth };
};
