import { useEffect, useRef, useState } from 'react';

export function useDebouncedValue<Value = unknown>(
  value: Value,
  {
    delay = 500,
    defaultValue,
  }: {
    delay?: number;
    defaultValue?: Value;
  } = {}
): Value {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedValue, setDebouncedValue] = useState<Value>(defaultValue);

  // Clear on unmount
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timeoutRef.current);
  }, [value, delay]);

  return debouncedValue;
}
