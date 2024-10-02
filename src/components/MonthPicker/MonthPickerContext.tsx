import { createContext, useContext, useMemo } from 'react';

type MonthPickerContextType = {
  onMonthClick?(month: Date): void;
  onTodayButtonClick?(): void;
  selectedMonths?: Array<Date>;
};

const MonthPickerContext = createContext<MonthPickerContextType>({});
export const useMonthPickerContext = () => useContext(MonthPickerContext);

export const MonthPickerProvider: React.FC<
  React.PropsWithChildren<MonthPickerContextType>
> = ({ onMonthClick, onTodayButtonClick, selectedMonths, children }) => {
  const contextValue = useMemo(
    () => ({
      onMonthClick,
      onTodayButtonClick,
      selectedMonths,
    }),
    [onMonthClick, onTodayButtonClick, selectedMonths]
  );
  return (
    <MonthPickerContext.Provider value={contextValue}>
      {children}
    </MonthPickerContext.Provider>
  );
};
