import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
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
    setYear(yearProp);
  }, [yearProp]);

  useEffect(() => {
    onYearChange?.(year);
  }, [onYearChange, year]);

  return (
    <YearContext.Provider
      value={{
        year,
        setYear,
      }}
    >
      {children}
    </YearContext.Provider>
  );
};
