import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

  useEffect(() => {
    // TODO @eslint-react rule
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setYear(yearProp);
  }, [yearProp]);

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
