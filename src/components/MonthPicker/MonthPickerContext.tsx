import { createContext, useContext } from 'react';

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
  return (
    <MonthPickerContext.Provider
      value={{
        onMonthClick,
        onTodayButtonClick,
        selectedMonths,
      }}
    >
      {children}
    </MonthPickerContext.Provider>
  );
};
