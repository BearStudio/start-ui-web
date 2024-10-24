import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useValueHasChanged } from '@/hooks/useValueHasChanged';

type YearContextType = {
  year: number;
  setYear: Dispatch<SetStateAction<number>>;
};

const YearContext = createContext<YearContextType>({
  year: new Date().getFullYear(),
  setYear: () => {},
});
export const useYearContext = () => useContext(YearContext);

interface YearProviderProp {
  year: number;
  onYearChange?(year: number): void;
}

export const YearProvider: React.FC<
  React.PropsWithChildren<YearProviderProp>
> = ({ year: yearProp, onYearChange, children }) => {
  const [year, setYear] = useState(yearProp);
  const yearHasChanged = useValueHasChanged(yearProp);

  if (yearHasChanged && yearProp !== year) {
    setYear(yearProp);
  }

  useEffect(() => {
    onYearChange?.(year);
  }, [onYearChange, year]);

  const contextValue = useMemo(
    () => ({
      year,
      setYear,
    }),
    [year]
  );

  return (
    <YearContext.Provider value={contextValue}>{children}</YearContext.Provider>
  );
};
