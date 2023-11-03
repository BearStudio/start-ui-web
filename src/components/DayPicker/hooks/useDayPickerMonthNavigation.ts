import { useState } from 'react';

import { DayPickerNavigationMode } from '@/components/DayPicker';

export type UseDayPickerMonthNavigationValue = {
  mode: DayPickerNavigationMode;
  setMode: (value: DayPickerNavigationMode) => void;
  toggleMode: () => void;
  month?: Date | null;
  setMonth: (value?: Date | null) => void;
  selectMonth: (value?: Date | null) => void;
};

/**
 * Ce hook permet de gérer la navigation entre les mois dans les DayPicker
 */
export const useDayPickerMonthNavigation = (
  date: Date | null = new Date()
): UseDayPickerMonthNavigationValue => {
  const [mode, setMode] = useState<DayPickerNavigationMode>('DAY');

  const toggleMode = () =>
    setMode((previousMode) => (previousMode === 'MONTH' ? 'DAY' : 'MONTH'));

  const [month, setMonth] = useState<Date | undefined | null>(date);

  const selectMonth = (date?: Date | null) => {
    setMonth(date);
    setMode('DAY');
  };

  return { mode, setMode, toggleMode, month, setMonth, selectMonth };
};
