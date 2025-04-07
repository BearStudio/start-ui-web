import { useRef } from 'react';

export const useValueHasChanged = (value: unknown) => {
  const valueRef = useRef(value);
  const valueHasChanged = valueRef.current !== value;
  valueRef.current = value;

  return valueHasChanged;
};
