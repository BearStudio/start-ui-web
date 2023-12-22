import { Content } from './Content';
import { MonthPickerProvider } from './MonthPickerContext';
import { YearProvider } from './YearContext';

interface MonthPickerProps {
  year?: number;
  onMonthClick?(month: Date): void;
  onTodayButtonClick?(): void;
  onYearChange?(year: number): void;
  selectedMonths?: Array<Date>;
}

export const MonthPicker: React.FC<
  React.PropsWithChildren<MonthPickerProps>
> = ({
  year = new Date().getFullYear(),
  onMonthClick,
  onTodayButtonClick,
  onYearChange,
  selectedMonths = [],
}) => {
  return (
    <YearProvider year={year} onYearChange={onYearChange}>
      <MonthPickerProvider
        onMonthClick={onMonthClick}
        onTodayButtonClick={onTodayButtonClick}
        selectedMonths={selectedMonths}
      >
        <Content />
      </MonthPickerProvider>
    </YearProvider>
  );
};
