import { useRef } from 'react';

export const useValueHasChanged = (value: unknown) => {
  const valueRef = useRef(value);
  // eslint-disable-next-line react-hooks/refs
  const valueHasChanged = valueRef.current !== value;
  // eslint-disable-next-line react-hooks/refs
  valueRef.current = value;

  return valueHasChanged;
};
